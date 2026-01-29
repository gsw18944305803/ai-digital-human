// 302.ai 写作服务
export const writingService = {
  // 获取工具列表 (GET /302/writing/api/v1/tools)
  getTools: async (apiKey, url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('获取工具列表失败');
      const data = await response.json();
      return data.data?.tools || [];
    } catch (e) {
      console.warn('Failed to fetch tools', e);
      return [];
    }
  },

  // 生成文案 (POST /302/writing/api/v1/generate)
  generate: async (apiKey, url, toolName, model, params) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool_name: toolName,
        model: model,
        params: params
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`生成文案失败: ${response.status} - ${errorText}`);
    }
    return await response.json();
  },

  // 保留的旧方法（兼容性）
  generateText: async (apiKey, url, prompt, toolId = null) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        tool_id: toolId
      })
    });
    if (!response.ok) throw new Error('生成失败');
    return await response.json();
  },

  // 生成长文大纲
  generateOutline: async (apiKey, url, topic, model) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: topic, // API使用title字段
        model: model || 'gpt-4o-mini'
      })
    });
    if (!response.ok) throw new Error('生成大纲失败');
    return await response.json();
  },

  // 生成长文内容 - 直接传递outline，让API解析
  generateLongText: async (apiKey, url, outlineData, model) => {
    // outlineData 可以是字符串或对象
    let sections = [];
    let title = '文档标题';

    if (typeof outlineData === 'object' && outlineData !== null) {
      // 如果是对象，直接使用其sections
      sections = outlineData.sections || outlineData.data?.sections || [];
      title = outlineData.title || outlineData.data?.title || '文档标题';
    } else if (typeof outlineData === 'string') {
      // 如果是字符串，尝试解析
      const lines = outlineData.split('\n').filter(line => line.trim());

      // 提取标题（第一行或Part之前的内容）
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.startsWith('# ')) {
          title = firstLine.substring(2).trim();
        } else if (!firstLine.startsWith('Part')) {
          title = firstLine.substring(0, 50);
        }
      }

      // 解析Part格式的大纲
      let currentSection = null;
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // 匹配 "Part X - 标题 - Word Count: N - 描述"
        const partMatch = trimmed.match(/^Part\s+\d+\s+-\s+([^-\n]+)\s+-\s+Word Count:\s*\d+\s+-\s*(.*)/);
        if (partMatch) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            type: 'text',
            content: `${partMatch[1].trim()} - ${partMatch[2].trim()}`
          };
        } else if (trimmed.startsWith('[图片建议]')) {
          // 图片建议
          if (currentSection) {
            sections.push(currentSection);
            currentSection = null;
          }
          sections.push({
            type: 'image',
            content: trimmed.replace('[图片建议]', '').trim()
          });
        } else if (currentSection) {
          // 附加到当前section
          currentSection.content += '\n' + trimmed;
        } else {
          // 独立的文本行
          sections.push({ type: 'text', content: trimmed });
        }
      });

      if (currentSection) {
        sections.push(currentSection);
      }

      // 如果解析失败，使用简单的逐行解析
      if (sections.length === 0) {
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed) {
            sections.push({ type: 'text', content: trimmed });
          }
        });
      }
    }

    console.log('📝 [LongText] 发送请求:', { title, sectionsCount: sections.length });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        sections: sections,
        model: model || 'gpt-4o-mini'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`生成正文失败: ${response.status} - ${errorText}`);
    }

    // 处理流式响应 (SSE格式)
    const text = await response.text();
    console.log('📝 [LongText] 原始响应长度:', text.length);

    // 尝试解析响应
    let data;
    // 首先尝试直接解析JSON（非流式响应）
    try {
      data = JSON.parse(text);
    } catch (e) {
      // JSON解析失败，处理SSE格式
      // SSE格式: data: {...} 或 data: 文本内容
      const lines = text.split('\n').filter(line => line.trim().startsWith('data:'));

      if (lines.length > 0) {
        // 收集所有data内容
        const contents = [];
        for (const line of lines) {
          const dataContent = line.replace('data:', '').trim();
          if (dataContent) {
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.content) contents.push(parsed.content);
              else if (parsed.result) contents.push(parsed.result);
              else if (parsed.data) contents.push(JSON.stringify(parsed.data));
            } catch {
              // 不是JSON，直接添加文本
              contents.push(dataContent);
            }
          }
        }
        data = { content: contents.join('\n\n') };
      } else {
        // 没有data:前缀，直接使用文本
        data = { content: text };
      }
    }

    console.log('📝 [LongText] 解析后数据类型:', typeof data);
    return data;
  }
};

// 302.ai 学术搜索服务
export const academicService = {
  // Arxiv论文搜索
  searchArxiv: async (apiKey, url, query, maxResults = 10, page = 1) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        page: page,
        sort_by: 'relevance',
        language: 'zh',
        id_list: []
      })
    });
    if (!response.ok) throw new Error('Arxiv搜索失败');
    return await response.json();
  },

  // 谷歌论文搜索
  searchGoogle: async (apiKey, url, query, maxResults = 10, page = 1) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        max_results: maxResults,
        page: page,
        sort_by: 'relevance',
        language: 'zh',
        id_list: []
      })
    });
    if (!response.ok) throw new Error('Google Scholar搜索失败');
    return await response.json();
  },

  // 通用搜索方法（兼容旧代码）
  search: async (apiKey, url, query, limit = 10) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        max_results: limit,
        page: 1,
        sort_by: 'relevance',
        language: 'zh',
        id_list: []
      })
    });
    if (!response.ok) throw new Error('搜索失败');
    return await response.json();
  }
};
