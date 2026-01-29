/**
 * 用户画像分析服务
 * 使用 LLM 分析用户行为数据，生成用户画像
 */

import { useSystemConfig } from '../hooks/useSystemConfig';

/**
 * 分析用户行为，生成用户画像
 * @param {object} activitySummary - 用户行为摘要
 * @param {string} apiKey - API Key
 * @param {string} apiUrl - API URL
 * @returns {Promise<object>} 用户画像
 */
export async function generateUserProfile(activitySummary, apiKey, apiUrl) {
  if (!activitySummary || activitySummary.totalActivities === 0) {
    return {
      industry: '未识别',
      role: '新用户',
      interests: [],
      habits: [],
      primaryFeatures: [],
      summary: '暂无足够的数据进行分析'
    };
  }

  try {
    // 构建分析提示词
    const analysisPrompt = `你是一个专业的用户行为分析师。请根据以下用户在过去${activitySummary.period}的使用行为数据，分析并生成用户画像。

【用户行为数据】
总活动次数：${activitySummary.totalActivities}次
高频使用功能（按频率排序）：
${activitySummary.topFeatures.map((f, i) => `${i + 1}. ${f.name}（使用${f.count}次，主要操作：${f.actions.join('、')}）`).join('\n')}

最近活动记录：
${activitySummary.activities.slice(-20).map(a => `[${new Date(a.timestamp).toLocaleString('zh-CN')}] 使用${a.featureName}，操作：${a.action}`).join('\n')}

【网站功能分类】
- 图片处理：绘画机器人、老照片修复、AI换衣、证件照生成等
- 信息处理：AI聊天、翻译大师、提示词专家、搜索大师等
- 工作效率：文案助手、PPT制作、文档编辑器等
- 代码相关：网页生成器、代码竞技场等
- 学术相关：论文搜索、PDF工具、论文写作、答题机等
- 音频相关：语音生成、音乐制作等

请分析并输出JSON格式的用户画像，包含以下字段：
{
  "industry": "推测的行业（如：教育、设计、技术开发、市场营销、学术研究、媒体等）",
  "role": "推测的工作角色（如：设计师、开发者、教师、学生、市场营销人员、研究人员、内容创作者等）",
  "interests": ["兴趣标签1", "兴趣标签2", ...],
  "habits": ["使用习惯1", "使用习惯2", ...],
  "primaryFeatures": ["最常用的3-5个功能"],
  "workStyle": "工作风格描述（如：创意型、技术型、学术型、效率型等）",
  "suggestions": ["基于用户画像的建议1", "建议2", ...],
  "summary": "一句话总结用户特点"
}

注意：
1. industry 和 role 要基于实际使用功能来推断
2. interests 应该反映用户的专业领域和兴趣点
3. habits 应该描述用户的使用模式和时间规律
4. primaryFeatures 选取使用频率最高的3-5个功能
5. 如果数据不足，industry 设为"未识别"，role 设为"新用户"`;

    const response = await fetch(apiUrl || '/api/302/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的用户行为分析师，擅长从用户行为数据中提取有价值的信息，生成准确的用户画像。只返回纯JSON格式，不要包含任何其他文字说明。'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    // 提取JSON内容
    let jsonContent = content.trim();

    // 移除可能的markdown代码块标记
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?|\n?```$/g, '');
    }

    const profile = JSON.parse(jsonContent);

    // 添加元数据
    profile.generatedAt = new Date().toISOString();
    profile.dataPeriod = activitySummary.period;
    profile.dataPoints = activitySummary.totalActivities;

    console.log('🎯 用户画像已生成:', profile);

    return profile;
  } catch (error) {
    console.error('生成用户画像失败:', error);

    // 返回基础画像
    return {
      industry: '未识别',
      role: '活跃用户',
      interests: [],
      habits: ['频繁使用AI工具'],
      primaryFeatures: activitySummary.topFeatures.slice(0, 3).map(f => f.name),
      workStyle: '探索型',
      suggestions: ['继续探索更多功能'],
      summary: 'AI数字员工的活跃用户',
      generatedAt: new Date().toISOString(),
      dataPeriod: activitySummary.period,
      dataPoints: activitySummary.totalActivities
    };
  }
}

/**
 * 根据用户画像优化提示词
 * @param {string} originalPrompt - 原始提示词
 * @param {object} userProfile - 用户画像
 * @param {string} currentFeature - 当前功能
 * @param {string} apiKey - API Key
 * @param {string} apiUrl - API URL
 * @returns {Promise<string>} 优化后的提示词
 */
export async function optimizePromptWithProfile(originalPrompt, userProfile, currentFeature, apiKey, apiUrl) {
  if (!userProfile || !userProfile.industry || userProfile.industry === '未识别') {
    return originalPrompt;
  }

  try {
    const profileContext = `
【用户画像】
行业：${userProfile.industry}
角色：${userProfile.role}
工作风格：${userProfile.workStyle}
常用功能：${userProfile.primaryFeatures?.join('、') || '无'}
兴趣领域：${userProfile.interests?.join('、') || '无'}
使用习惯：${userProfile.habits?.join('、') || '无'}
用户特点：${userProfile.summary || '无'}`;

    const optimizationPrompt = `你是一个专业的提示词优化专家。请根据用户的个人画像，优化其输入的提示词，使其更符合用户的行业特点和工作风格。

${profileContext}

【当前功能】${currentFeature}

【原始提示词】
${originalPrompt}

请优化上述提示词，使其：
1. 符合用户所在的${userProfile.industry}行业特点
2. 适应${userProfile.role}的工作方式
3. 融合用户的${userProfile.workStyle}工作风格
4. 保持原意不变的前提下更加专业和精准

直接输出优化后的提示词，不要有任何解释或前言。`;

    const response = await fetch(apiUrl || '/api/302/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4.7-flashx',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的提示词优化专家，能够根据用户画像个性化优化提示词。只输出优化后的提示词内容，不要包含任何解释。'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let optimizedPrompt = data.choices?.[0]?.message?.content || originalPrompt;

    // 清理可能的引号包裹
    optimizedPrompt = optimizedPrompt.replace(/^["']|["']$/g, '').trim();

    console.log('✨ 基于用户画像优化了提示词');

    return optimizedPrompt;
  } catch (error) {
    console.error('基于用户画像优化提示词失败:', error);
    return originalPrompt;
  }
}

/**
 * 生成每日总结报告
 * @param {object} activitySummary - 用户行为摘要
 * @param {object} userProfile - 用户画像
 * @param {string} apiKey - API Key
 * @param {string} apiUrl - API URL
 * @returns {Promise<string>} 每日总结报告
 */
export async function generateDailySummary(activitySummary, userProfile, apiKey, apiUrl) {
  try {
    const profileInfo = userProfile ? `
【用户画像】
行业：${userProfile.industry}
角色：${userProfile.role}
工作风格：${userProfile.workStyle}
` : '';

    const summaryPrompt = `你是一个贴心的AI助手。请为用户生成一份温馨的每日使用总结。

${profileInfo}
【今日使用数据】
总活动次数：${activitySummary.totalActivities}次
使用功能：${activitySummary.topFeatures.map(f => f.name).join('、')}

请生成一份简洁、友好的每日总结（不超过150字），包含：
1. 今天的活跃程度
2. 使用的主要功能
3. 一句鼓励的话
4. 如果有新的发现或建议，也可以提及

用第二人称（"你"）来写，语气友好、温暖。`;

    const response = await fetch(apiUrl || '/api/302/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一个贴心的AI助手，擅长用温暖友好的语气与用户交流。'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '今天使用愉快！';
  } catch (error) {
    console.error('生成每日总结失败:', error);
    return '今天又是充实的一天！继续加油！';
  }
}

export default {
  generateUserProfile,
  optimizePromptWithProfile,
  generateDailySummary
};
