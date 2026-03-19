// 多平台视频数据提取页面修改 - 分离抖音和小红书
      function modifyVideoExtractorPage() {
        const hash = window.location.hash || "";

        // 从 hash 中解析 URL 参数 (格式: #/backend?title=xxx)
        let title = '';
        if (hash.includes('title=')) {
          const titleMatch = hash.match(/title=([^&]*)/);
          if (titleMatch) {
            title = decodeURIComponent(titleMatch[1]);
          }
        }
        console.log('当前页面标题:', title);

        // 检查是否是视频提取页面
        if (!title || !title.includes('视频数据')) {
          return;
        }

        console.log('检测到视频提取页面，准备修改UI');

        // 等待React渲染
        setTimeout(function() {
          // 查找输入框区域
          const inputArea = document.querySelector('input[placeholder*="小红书或抖音"]');
          if (!inputArea) {
            console.log('未找到输入区域');
            return;
          }

          // 检查是否已经修改过
          if (document.getElementById('separated-extractor')) {
            return;
          }

          // 获取父容器
          const parentContainer = inputArea.closest('div[class*="flex"]');
          if (!parentContainer) {
            console.log('未找到父容器');
            return;
          }

          // 隐藏原来的输入区域
          const originalSection = parentContainer.parentElement;
          if (originalSection) {
            originalSection.style.display = 'none';
          }

          // 创建新的分离式布局
          const newContainer = document.createElement('div');
          newContainer.id = 'separated-extractor';
          newContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
              <!-- 抖音提取区域 -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🎵</div>
                  <div>
                    <div style="font-size: 18px; font-weight: 600; color: #fff;">抖音视频提取</div>
                    <div style="font-size: 13px; color: #888;">提取抖音视频文案和互动数据</div>
                  </div>
                </div>
                <div style="margin-bottom: 12px;">
                  <input type="text" id="douyin-url-input" placeholder="粘贴抖音视频链接..." style="width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;">
                </div>
                <button onclick="extractDouyin()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); border: none; border-radius: 10px; color: #000; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>🚀</span>
                  <span>开始提取</span>
                  <span style="background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px; font-size: 12px;">15 算力</span>
                </button>
              </div>

              <!-- 小红书提取区域 -->
              <div style="background: linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 100%); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📕</div>
                  <div>
                    <div style="font-size: 18px; font-weight: 600; color: #fff;">小红书内容提取</div>
                    <div style="font-size: 13px; color: #888;">AI智能提取笔记内容</div>
                  </div>
                </div>
                <div style="margin-bottom: 12px;">
                  <input type="text" id="xiaohongshu-url-input" placeholder="粘贴小红书链接..." style="width: 100%; padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;">
                </div>
                <button onclick="extractXiaohongshu()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%); border: none; border-radius: 10px; color: #fff; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <span>🤖</span>
                  <span>AI智能提取</span>
                  <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; font-size: 12px;">Coze智能体</span>
                </button>
              </div>
            </div>

            <!-- 结果展示区域 -->
            <div id="extract-result-area" style="margin-top: 20px; display: none;">
              <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <div style="font-size: 16px; font-weight: 600; color: #fff;">📋 提取结果</div>
                  <button onclick="copyExtractResult()" style="background: rgba(255,255,255,0.1); border: none; padding: 8px 16px; border-radius: 8px; color: #fff; cursor: pointer; font-size: 13px;">复制内容</button>
                </div>
                <div id="extract-result-content" style="color: #ccc; line-height: 1.8; font-size: 14px; white-space: pre-wrap;"></div>
              </div>
            </div>
          `;

          // 插入到原位置
          if (originalSection && originalSection.parentNode) {
            originalSection.parentNode.insertBefore(newContainer, originalSection.nextSibling);
          }

          console.log('视频提取页面UI已修改');
        }, 1500);
      }

      // 抖音提取函数
      window.extractDouyin = async function() {
        const url = document.getElementById('douyin-url-input').value.trim();
        if (!url) {
          alert('请输入抖音视频链接');
          return;
        }

        if (!url.includes('douyin.com') && !url.includes('iesdouyin.com')) {
          alert('请输入正确的抖音链接');
          return;
        }

        const resultArea = document.getElementById('extract-result-area');
        const resultContent = document.getElementById('extract-result-content');
        resultArea.style.display = 'block';
        resultContent.innerHTML = '⏳ 正在提取抖音视频数据...';

        try {
          // 调用后端API
          const response = await fetch('/api/douyin/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });

          if (response.ok) {
            const data = await response.json();
            resultContent.innerHTML = formatDouyinResult(data);
          } else {
            resultContent.innerHTML = '❌ 提取失败，请检查链接是否有效';
          }
        } catch (error) {
          console.error('提取错误:', error);
          resultContent.innerHTML = '❌ 网络错误，请稍后重试';
        }
      };

      // 格式化抖音结果
      function formatDouyinResult(data) {
        return `
📱 视频标题: ${data.title || data.desc || '未知'}

📝 视频文案:
${data.desc || data.text || '无'}

📊 互动数据:
  👍 点赞: ${data.likes || data.digg_count || '-'}
  💬 评论: ${data.comments || data.comment_count || '-'}
  ⭐ 收藏: ${data.collects || data.collect_count || '-'}
  🔄 转发: ${data.shares || data.share_count || '-'}
        `;
      }

      // 小红书提取函数 - 使用Coze智能体
      window.extractXiaohongshu = async function() {
        const url = document.getElementById('xiaohongshu-url-input').value.trim();
        if (!url) {
          alert('请输入小红书链接');
          return;
        }

        if (!url.includes('xiaohongshu.com') && !url.includes('xhslink.com')) {
          alert('请输入正确的小红书链接');
          return;
        }

        const resultArea = document.getElementById('extract-result-area');
        const resultContent = document.getElementById('extract-result-content');
        resultArea.style.display = 'block';
        resultContent.innerHTML = '🤖 Coze智能体正在分析小红书内容...';

        try {
          // 调用Coze智能体API
          // 请将下面的bot_id和token替换为您自己的Coze配置
          const COZE_BOT_ID = 'YOUR_BOT_ID';  // 替换为您的Coze Bot ID
          const COZE_TOKEN = 'YOUR_COZE_TOKEN';  // 替换为您的Coze API Token

          const response = await fetch('https://api.coze.cn/v3/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${COZE_TOKEN}`
            },
            body: JSON.stringify({
              bot_id: COZE_BOT_ID,
              user_id: 'user_' + Date.now(),
              stream: false,
              additional_messages: [{
                role: 'user',
                content: `请提取并分析以下小红书链接的内容：${url}`,
                content_type: 'text'
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const result = data.data?.output || data.data?.content || '提取成功';
            resultContent.innerHTML = `📕 小红书内容提取结果:\n\n${result}`;
          } else {
            // 如果Coze API调用失败，尝试使用本地后端
            const fallbackResponse = await fetch('/api/xiaohongshu/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
            });

            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              resultContent.innerHTML = formatXiaohongshuResult(data);
            } else {
              resultContent.innerHTML = '❌ 提取失败，请检查链接是否有效或Coze配置是否正确';
            }
          }
        } catch (error) {
          console.error('提取错误:', error);
          resultContent.innerHTML = '❌ 网络错误，请稍后重试\n\n提示: 请确保已配置Coze智能体API';
        }
      };

      // 格式化小红书结果
      function formatXiaohongshuResult(data) {
        return `
📕 笔记标题: ${data.title || '未知'}

📝 笔记内容:
${data.desc || data.content || '无'}

📊 互动数据:
  👍 点赞: ${data.likes || '-'}
  💬 评论: ${data.comments || '-'}
  ⭐ 收藏: ${data.collects || '-'}
        `;
      }

      // 复制结果
      window.copyExtractResult = function() {
        const content = document.getElementById('extract-result-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
          alert('已复制到剪贴板');
        }).catch(() => {
          // 备用复制方法
          const textarea = document.createElement('textarea');
          textarea.value = content;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('已复制到剪贴板');
        });
      };

      // 监听页面变化，检测视频提取页面
      function initVideoExtractorModifier() {
        modifyVideoExtractorPage();
      }

      // 页面加载后初始化
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          // 延迟执行，等待React渲染
          setTimeout(initVideoExtractorModifier, 2000);
          setTimeout(replacePatentSearchUI, 2000);
          setTimeout(ensurePatentBodyObserver, 2000);
        });
      } else {
        setTimeout(initVideoExtractorModifier, 2000);
        setTimeout(replacePatentSearchUI, 2000);
        setTimeout(ensurePatentBodyObserver, 2000);
      }

      // 监听hash变化
      window.addEventListener('hashchange', function() {
        // 移除之前的替换
        const existingExtractor = document.getElementById('separated-extractor');
        if (existingExtractor) existingExtractor.remove();

        ensurePatentBodyObserver();
        setTimeout(initVideoExtractorModifier, 1500);
        setTimeout(replacePatentSearchUI, 300);
      });