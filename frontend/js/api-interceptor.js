// 全局Fetch拦截器 - 自动扣除算力
      function setupFetchInterceptor() {
        if (window.originalFetch) return;

        const originalFetch = window.fetch;
        window.originalFetch = originalFetch;

        window.fetch = function(input, init) {
          const url = typeof input === 'string' ? input : (input.url || '');
          const method = (init && init.method) || 'GET';

          // 检查是否是AI相关的API请求（包括外部AI服务）
          const aiApiPatterns = [
            // 后端API
            '/api/ai-', '/api/chat', '/api/completions',
            '/api/jimeng/', '/api/kb/', '/api/302/',
            '/api/claude', '/api/gpt', '/api/gemini',
            '/api/deepseek', '/api/glm', '/api/qwen',
            // 外部AI服务
            'api.302.ai', 'api.openai.com', 'api.anthropic.com',
            'api.claude.ai', 'generativelanguage.googleapis.com',
            'api.deepseek.com', 'open.bigmodel.cn', 'dashscope.aliyuncs.com'
          ];

          const isAiApi = aiApiPatterns.some(pattern => url.includes(pattern));

          if (isAiApi && method === 'POST') {
            // 尝试扣除算力
            setTimeout(() => {
              if (window.deductUserCompute) {
                // 根据API类型设置不同的算力费用
                let cost = 1; // 默认1点
                if (url.includes('jimeng') || url.includes('video') || url.includes('sora') || url.includes('veo')) {
                  cost = 50; // 视频生成50点
                } else if (url.includes('image') || url.includes('生图') || url.includes('dalle') || url.includes('midjourney')) {
                  cost = 10; // 图片生成10点
                } else if (url.includes('claude') || url.includes('gpt-5') || url.includes('gemini-2.5') || url.includes('opus')) {
                  cost = 5; // 高级模型5点
                } else {
                  cost = 1; // 普通聊天1点
                }

                const result = window.deductUserCompute(cost, 'AI API调用');
                console.log('AI请求算力自动扣除:', { url: url, cost: cost, result: result });
              }
            }, 100);
          }

          return originalFetch.apply(this, arguments);
        };
        console.log('Fetch拦截器已设置');
      }

      // 监听用户登录变化事件
      window.addEventListener('user_login_change', function() {
        initUserComputeSystem();
        rewriteDeductFunction();
      });