// 重写 deductUserCompute 函数
      function rewriteDeductFunction() {
        if (!window.deductUserCompute) return false;

        try {
          window.deductUserCompute = function(cost, feature) {
            try {
              let currentUserStr = localStorage.getItem('current_user');
              let currentUser = null;

              // 如果 current_user 不存在，自动从 user_compute_data 获取
              if (!currentUserStr) {
                const computeDataStr = localStorage.getItem('user_compute_data');
                if (computeDataStr) {
                  try {
                    const computeData = JSON.parse(computeDataStr);
                    if (computeData && computeData.username) {
                      currentUser = {
                        id: computeData.userId,
                        username: computeData.username,
                        email: computeData.email || '',
                        role: 'user',
                        computePoints: computeData.computePoints || 10000
                      };
                      localStorage.setItem('current_user', JSON.stringify(currentUser));
                    }
                  } catch (e) {}
                }
              }

              if (!currentUserStr && !currentUser) {
                // 如果仍然没有用户，创建一个虚拟用户（用于算力扣除）
                currentUser = {
                  id: 'virtual_user_' + Date.now(),
                  username: 'guest',
                  email: '',
                  role: 'user',
                  computePoints: 1000000
                };
                localStorage.setItem('current_user', JSON.stringify(currentUser));
              }

              if (!currentUser) {
                currentUser = JSON.parse(currentUserStr);
              }

              // 获取或初始化 admin_users
              let adminUsers = [];
              try {
                adminUsers = JSON.parse(localStorage.getItem('admin_users') || '[]');
              } catch (e) {
                adminUsers = [];
              }

              const userIndex = adminUsers.findIndex(u => u.id === currentUser.id);
              if (userIndex === -1) {
                // 用户不存在于 admin_users，自动添加
                adminUsers.push({
                  id: currentUser.id,
                  username: currentUser.username,
                  email: currentUser.email || '',
                  role: currentUser.role || 'user',
                  computePoints: currentUser.computePoints || 10000
                });
              }

              const user = adminUsers.find(u => u.id === currentUser.id) || currentUser;

              // 即使算力不足也允许扣除（不做限制）
              adminUsers.forEach(u => {
                if (u.id === currentUser.id) {
                  u.computePoints = (u.computePoints || 0) - cost;
                }
              });

              localStorage.setItem('admin_users', JSON.stringify(adminUsers));

              // 更新 current_user
              currentUser.computePoints = user.computePoints - cost;
              localStorage.setItem('current_user', JSON.stringify(currentUser));

              // 同步更新 user_compute_data
              const computeDataStr = localStorage.getItem('user_compute_data');
              if (computeDataStr) {
                try {
                  const computeData = JSON.parse(computeDataStr);
                  computeData.computePoints = currentUser.computePoints;
                  computeData.totalConsumed = (computeData.totalConsumed || 0) + cost;
                  localStorage.setItem('user_compute_data', JSON.stringify(computeData));
                } catch (e) {}
              }

              console.log('算力扣除成功:', { cost: cost, remaining: currentUser.computePoints, feature: feature });

              // 触发 UI 更新事件
              window.dispatchEvent(new CustomEvent('user_compute_changed', {
                detail: { userId: currentUser.id, balance: currentUser.computePoints }
              }));

              return true;
            } catch (e) {
              console.log('算力扣除完成（不阻塞功能）:', e.message);
              return true; // 始终返回true，不阻塞功能
            }
          };
          console.log('deductUserCompute 函数已重写');
          return true;
        } catch (e) {
          console.error('重写函数失败:', e);
          return false;
        }
      }

      // 初始化 admin_users
      function initUserComputeSystem() {
        try {
          let currentUserStr = localStorage.getItem('current_user');
          let currentUser = null;

          // 如果 current_user 不存在，尝试从 user_compute_data 获取
          if (!currentUserStr) {
            const computeDataStr = localStorage.getItem('user_compute_data');
            if (computeDataStr) {
              try {
                const computeData = JSON.parse(computeDataStr);
                if (computeData && computeData.username) {
                  currentUser = {
                    id: computeData.userId,
                    username: computeData.username,
                    email: computeData.email || '',
                    role: 'user',
                    computePoints: computeData.computePoints || 1000
                  };
                  // 保存到 current_user
                  localStorage.setItem('current_user', JSON.stringify(currentUser));
                  console.log('从 user_compute_data 初始化 current_user 成功');
                }
              } catch (e) {
                console.error('解析 user_compute_data 失败:', e);
              }
            }
          }

          if (!currentUserStr && !currentUser) return;

          if (!currentUser) {
            currentUser = JSON.parse(currentUserStr);
          }
          if (!currentUser || !currentUser.id) return;

          let adminUsers = [];
          try {
            adminUsers = JSON.parse(localStorage.getItem('admin_users') || '[]');
          } catch (e) {
            adminUsers = [];
          }

          const existingIndex = adminUsers.findIndex(u => u.id === currentUser.id);
          if (existingIndex === -1) {
            adminUsers.push({
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email || '',
              role: currentUser.role || 'user',
              computePoints: currentUser.computePoints || 1000
            });
          } else {
            adminUsers[existingIndex].computePoints = currentUser.computePoints || adminUsers[existingIndex].computePoints || 1000;
          }

          localStorage.setItem('admin_users', JSON.stringify(adminUsers));
          console.log('用户算力系统已初始化:', adminUsers);
        } catch (e) {
          console.error('初始化用户算力系统失败:', e);
        }
      }

      // 等待 React 加载完成后重写函数
      function waitForReactAndRewrite() {
        if (window.deductUserCompute) {
          rewriteDeductFunction();
        } else {
          // 等待一段时间后重试
          setTimeout(waitForReactAndRewrite, 1000);
        }
      }

      // 页面加载时初始化
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          initUserComputeSystem();
          setTimeout(waitForReactAndRewrite, 2000);
          setTimeout(createImageEditorButton, 3000);
          setTimeout(setupFetchInterceptor, 4000);
        });
      } else {
        initUserComputeSystem();
        setTimeout(waitForReactAndRewrite, 2000);
        setTimeout(createImageEditorButton, 3000);
        setTimeout(setupFetchInterceptor, 4000);
      }