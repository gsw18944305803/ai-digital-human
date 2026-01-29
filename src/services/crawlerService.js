
export const crawlerService = {
  // 1. 生成 Schema (Generate Schema)
  generateSchema: async (apiKey, url, prompt = "提取网页中的主要内容，包括标题、正文、作者、发布时间等") => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });
    if (!response.ok) throw new Error('生成 Schema 失败');
    return await response.json();
  },

  // 2. 创建提取任务 (Create Task)
  createTask: async (apiKey, url, schema, targetUrl, target = '') => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: [targetUrl],
        target: target || '提取网页内容',
        schema: schema,
        recursiveConfig: {
          maxDepth: 1,
          maxPages: 1
        },
        proxyConfig: {
          useProxy: false
        },
        browserConfig: {
          useBrowser: true,
          waitTime: 2000
        }
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`创建提取任务失败: ${response.status} - ${errorText}`);
    }
    return await response.json();
  },

  // 3. 查询任务结果 (Check Task)
  checkTask: async (apiKey, urlTemplate, taskId) => {
    const url = urlTemplate.replace('{taskId}', taskId);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('查询任务失败');
    return await response.json();
  }
};
