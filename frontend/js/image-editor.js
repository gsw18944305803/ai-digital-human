// 图片编辑功能入口 - 添加到图片处理下拉菜单
      function createImageEditorButton() {
        setTimeout(function() {
          try {
            // 创建图片编辑入口按钮
            var btn = document.createElement('a');
            btn.href = '/image-editor.html';
            btn.target = '_blank';
            btn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 16px;color:#fff;text-decoration:none;border-radius:6px;margin:2px 8px;transition:background 0.2s;font-size:14px;cursor:pointer;';
            btn.innerHTML = '<span>🎨</span><span>图片编辑</span>';
            btn.onmouseover = function() { this.style.background = 'rgba(255,255,255,0.1)'; };
            btn.onmouseout = function() { this.style.background = ''; };

            // 监听下拉菜单展开事件，找到图片处理下拉菜单后添加入口
            var observer = new MutationObserver(function(mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                  for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType === 1) { // Element node
                      // 检查是否包含"绘画机器人"等下拉菜单项
                      if (node.textContent && node.textContent.includes('绘画机器人')) {
                        // 找到下拉菜单容器，直接添加
                        node.appendChild(btn);
                        console.log('图片编辑入口已添加到下拉菜单');
                        observer.disconnect();
                        return;
                      }
                    }
                  }
                }
              }
            });

            // 观察整个document的变化
            observer.observe(document.body, { childList: true, subtree: true });

            // 备用方法：5秒后如果还没找到，手动尝试
            setTimeout(function() {
              observer.disconnect();
              // 尝试直接查找已展开的下拉菜单
              var dropdowns = document.querySelectorAll('[class*="dropdown"], [class*="menu"], .ant-dropdown');
              for (var d = 0; d < dropdowns.length; d++) {
                if (dropdowns[d].textContent && dropdowns[d].textContent.includes('绘画机器人')) {
                  dropdowns[d].appendChild(btn);
                  console.log('图片编辑入口已添加 (备用方法)');
                  return;
                }
              }
              console.log('未找到下拉菜单');
            }, 5000);

          } catch(e) {
            console.error('添加图片编辑入口失败:', e);
          }
        }, 2000);
      }