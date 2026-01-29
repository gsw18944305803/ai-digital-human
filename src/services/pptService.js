// 302.ai PPT 生成服务
export const pptService = {
  // 1. 生成大纲 (Generate Outline) - API使用subject参数，返回SSE流式数据
  generateOutline: async (apiKey, url, subject) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: subject,
        is_card_note: false,
        stream: false  // 明确设置为非流式返回
      })
    });
    if (!response.ok) throw new Error('生成大纲失败');

    // 尝试解析为JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      // 如果是SSE格式，提取data内容
      const lines = text.split('\n').filter(line => line.trim().startsWith('data:'));
      if (lines.length > 0) {
        const lastDataLine = lines[lines.length - 1].replace('data:', '').trim();
        return JSON.parse(lastDataLine);
      }
      throw new Error('无法解析API响应');
    }
  },

  // 2. 生成PPT (同步接口) - 使用 generatepptx 端点
  generateContent: async (apiKey, url, outlineData, templateId = null) => {
    // outlineData 可能是对象(包含text字段)或字符串
    let outlineMarkdown = '';

    if (typeof outlineData === 'object' && outlineData !== null) {
      // 如果是对象，提取 text 字段（markdown格式）
      outlineMarkdown = outlineData.text || outlineData.data?.result?.text || JSON.stringify(outlineData, null, 2);
    } else if (typeof outlineData === 'string') {
      outlineMarkdown = outlineData;
    } else {
      outlineMarkdown = JSON.stringify(outlineData);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        outlineContentMarkdown: outlineMarkdown,
        templateId: templateId,
        pptxProperty: false
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`生成PPT失败: ${response.status} - ${errorText}`);
    }
    return await response.json();
  },

  // 3. 查询生成状态 (Check Status)
  checkStatus: async (apiKey, url, taskId) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: taskId })
    });
    if (!response.ok) throw new Error('查询状态失败');
    return await response.json();
  },

  // 4. 获取模板列表 (Get Templates) - API使用POST方法，需要filters参数
  getTemplates: async (apiKey, url, page = 1, size = 20) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: page,
        size: size,
        filters: {
          type: 1,  // 1=公共模板, 4=个人模板
          category: '',
          style: '',
          themeColor: ''
        }
      })
    });
    if (!response.ok) return { data: [] };
    return await response.json();
  },

  // 5. 文件解析 (Parse File)
  parseFile: async (apiKey, url, fileUrl, mode = 'ppt') => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_url: fileUrl,
        mode: mode
      })
    });
    if (!response.ok) throw new Error('文件解析失败');
    return await response.json();
  },

  // 6. 获取模板选项 (Template Options)
  getTemplateOptions: async (apiKey, url) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) return null;
    return await response.json();
  },

  // 7. 下载 PPT (Download PPT)
  downloadPPT: async (apiKey, url, id) => {
    // 假设是 POST id 返回下载链接，或者直接是下载流
    // 根据 302 常见模式，通常是 POST {id} 返回 { url: "..." }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('获取下载链接失败');
    return await response.json();
  },

  // 8. 加载 PPT 数据 (Load PPTX)
  loadPPT: async (apiKey, url, id) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('加载PPT数据失败');
    return await response.json();
  }
};
