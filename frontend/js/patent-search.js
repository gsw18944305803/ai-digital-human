// AI专利搜索界面替换
      window.__patentObserver = window.__patentObserver || null;
      window.__patentBodyObserver = window.__patentBodyObserver || null;
      window.__patentBodyTimer = window.__patentBodyTimer || null;

      function ensurePatentBodyObserver() {
        if (window.__patentBodyObserver) return;
        window.__patentBodyObserver = new MutationObserver(function() {
          if (window.__patentBodyTimer) clearTimeout(window.__patentBodyTimer);
          window.__patentBodyTimer = setTimeout(replacePatentSearchUI, 150);
        });
        window.__patentBodyObserver.observe(document.body, { childList: true, subtree: true });
      }

      function disconnectPatentBodyObserver() {
        if (!window.__patentBodyObserver) return;
        window.__patentBodyObserver.disconnect();
        window.__patentBodyObserver = null;
      }

      function ensurePatentObserver(container) {
        if (window.__patentObserver) return;
        window.__patentObserver = new MutationObserver(function() {
          const ui = document.getElementById('patent-search-container');
          if (!ui || !container.contains(ui)) return;
          Array.from(container.children).forEach(child => {
            if (child.id !== 'patent-search-container') child.style.display = 'none';
          });
        });
        window.__patentObserver.observe(container, { childList: true });
      }

      function disconnectPatentObserver() {
        if (!window.__patentObserver) return;
        window.__patentObserver.disconnect();
        window.__patentObserver = null;
      }

      function replacePatentSearchUI() {
        const hash = window.location.hash || "";
        let title = '';
        if (hash.includes('title=')) {
          const titleMatch = hash.match(/title=([^&]*)/);
          if (titleMatch) {
            title = decodeURIComponent(titleMatch[1]);
          }
        }
        
        let decodedHash = hash;
        try { decodedHash = decodeURIComponent(hash); } catch (e) {}
        const isPatentPage = title.indexOf('专利') !== -1 || hash.indexOf('专利') !== -1 || decodedHash.indexOf('专利') !== -1;
        if (!isPatentPage) {
          const existingPatent = document.getElementById('patent-search-container');
          if (existingPatent) {
            const parent = existingPatent.parentElement;
            existingPatent.remove();
            if (parent) {
              Array.from(parent.children).forEach(child => {
                child.style.display = '';
              });
            }
          }
          disconnectPatentObserver();
          disconnectPatentBodyObserver();
          return;
        }

        console.log('检测到AI专利搜索页面，尝试替换UI...');

        // 查找内容容器：尝试多个可能的选择器
        let container = document.querySelector('main');
        
        // 如果有多个main，通常取最后一个（因为可能有布局嵌套）
        const mains = document.querySelectorAll('main');
        if (mains.length > 1) container = mains[mains.length - 1];
        
        if (!container) {
          // 备用选择器
          container = document.querySelector('.flex-1.overflow-y-auto') || 
                      document.querySelector('.flex-1.overflow-hidden') ||
                      document.getElementById('root')?.lastElementChild;
        }

        if (!container) {
          console.log('未找到内容容器，等待...');
          return;
        }

        // 检查是否已经替换过
        const existingUI = document.getElementById('patent-search-container');
        if (existingUI) {
          if (!container.contains(existingUI)) {
            container.appendChild(existingUI);
          }
          Array.from(container.children).forEach(child => {
            if (child.id !== 'patent-search-container' && child.style.display !== 'none') {
              child.style.display = 'none';
            }
          });
          ensurePatentObserver(container);
          return;
        }

        // 隐藏容器内原有的所有子元素
        Array.from(container.children).forEach(child => {
          child.style.display = 'none';
        });

        // 创建新的专利搜索界面
        const newContainer = document.createElement('div');
        newContainer.id = 'patent-search-container';
        // 修改为非fixed定位，而是填充父容器
        newContainer.className = 'w-full h-full bg-[#0f172a] text-white overflow-hidden flex flex-col font-sans relative'; 
        
        // 使用 Tailwind CSS 构建的桌面端 Dashboard 界面
        newContainer.innerHTML = `
            <!-- 动态背景 -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-50"></div>
                <div class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] opacity-50"></div>
            </div>

            <!-- 顶部导航栏 -->
            <header class="relative z-10 flex-none h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 shadow-md">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    </div>
                    <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">AI 全球专利智能搜索</h1>
                </div>
                <div class="flex items-center gap-4">
                     <span class="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">全球专利数据库已连接</span>
                     <button onclick="window.history.back()" class="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors border border-red-500/10" title="返回主页">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        返回主页
                     </button>
                </div>
            </header>

            <!-- 主体布局 -->
            <div class="flex-1 flex overflow-hidden relative z-10">
                
                <!-- 左侧边栏：搜索与筛选 (固定宽度) -->
                <aside class="w-[320px] flex-none bg-slate-900/50 backdrop-blur-sm border-r border-white/10 flex flex-col shadow-xl">
                    <div class="p-5 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        
                        <!-- 搜索框区域 -->
                        <div class="space-y-3">
                            <label class="text-xs font-semibold text-blue-400 uppercase tracking-wider">核心检索</label>
                            <div class="relative group">
                                <input type="text" id="patentKeywordInput" 
                                    class="w-full bg-slate-800/80 border border-white/10 rounded-xl py-3 px-4 pl-11 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                                    placeholder="输入技术关键词、专利号..."
                                >
                                <svg class="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button id="patentSearchBtn" onclick="performPatentSearch()" class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                <span>🚀 开始智能检索</span>
                            </button>
                        </div>

                        <hr class="border-white/10">

                        <!-- 热门领域 -->
                        <div class="space-y-4">
                            <label class="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                热门技术赛道
                            </label>
                            
                            <div class="space-y-3">
                                <div class="bg-slate-800/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                                    <div class="text-xs text-gray-400 mb-2">新能源</div>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs cursor-pointer hover:bg-emerald-500/20" onclick="selectPatentTag(this)">固态电池</span>
                                        <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs cursor-pointer hover:bg-emerald-500/20" onclick="selectPatentTag(this)">钙钛矿</span>
                                    </div>
                                </div>

                                <div class="bg-slate-800/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                                    <div class="text-xs text-gray-400 mb-2">人工智能</div>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs cursor-pointer hover:bg-blue-500/20" onclick="selectPatentTag(this)">LLM</span>
                                        <span class="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs cursor-pointer hover:bg-blue-500/20" onclick="selectPatentTag(this)">Transformer</span>
                                        <span class="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs cursor-pointer hover:bg-blue-500/20" onclick="selectPatentTag(this)">自动驾驶</span>
                                    </div>
                                </div>

                                <div class="bg-slate-800/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                                    <div class="text-xs text-gray-400 mb-2">半导体</div>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs cursor-pointer hover:bg-amber-500/20" onclick="selectPatentTag(this)">GAAFET</span>
                                        <span class="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-xs cursor-pointer hover:bg-amber-500/20" onclick="selectPatentTag(this)">EUV</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 底部信息 -->
                    <div class="p-4 border-t border-white/10 bg-slate-900/80">
                         <div class="text-xs text-gray-500 text-center">AI Patent Search Engine v2.0</div>
                    </div>
                </aside>

                <!-- 右侧主内容区：结果展示 -->
                <main class="flex-1 flex flex-col min-w-0 bg-slate-900/30">
                    
                    <!-- 工具栏 -->
                    <div class="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
                         <div class="flex items-center gap-4">
                             <h2 class="text-sm font-medium text-white flex items-center gap-2">
                                <span id="patentResultsTitle">检索结果</span>
                                <span id="patentResultsCount" class="hidden px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">0</span>
                             </h2>
                         </div>
                         <div class="flex items-center gap-2">
                             <button onclick="exportPatentResults()" class="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-colors border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                导出报表
                             </button>
                         </div>
                    </div>

                    <!-- 滚动内容区 -->
                    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                        
                        <!-- 初始空状态 -->
                        <div id="patentEmptyState" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500/50"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            </div>
                            <h3 class="text-xl font-medium text-white mb-2">准备就绪</h3>
                            <p class="text-sm text-gray-500 max-w-md text-center">
                                请在左侧输入关键词，系统将连接全球专利数据库进行深度检索与分析。
                            </p>
                        </div>

                        <!-- 加载状态 -->
                        <div id="patentLoadingState" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-20">
                            <div class="relative w-20 h-20 mb-6">
                                <div class="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                                <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-2xl">🧠</span>
                                </div>
                            </div>
                            <h3 class="text-xl font-medium text-white mb-2">AI 正在深度分析</h3>
                            <p class="text-blue-400 animate-pulse">正在检索全球专利数据库...</p>
                        </div>

                        <!-- 结果列表容器 -->
                        <div id="patentResultsList" class="hidden space-y-4 max-w-5xl mx-auto pb-10">
                            <!-- JS 动态插入结果 -->
                        </div>
                    </div>
                </main>
            </div>

            <style>
              .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
              
              /* 动画 */
              @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
              .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
            </style>
        `;

        // 插入新界面
        container.appendChild(newContainer);
        
        // 绑定事件
        const input = document.getElementById('patentKeywordInput');
        if (input) {
          input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performPatentSearch();
          });
        }

        console.log('AI专利搜索UI已替换');
        ensurePatentObserver(container);

      }

      // 标签选择
      window.selectPatentTag = function(element) {
        const keyword = element.textContent;
        const input = document.getElementById('patentKeywordInput');
        if (input) {
          input.value = keyword;
          performPatentSearch();
        }
      };

      // 执行专利搜索
      window.performPatentSearch = async function() {
        const input = document.getElementById('patentKeywordInput');
        const keyword = input ? input.value.trim() : '';
        
        if (!keyword) {
          alert('请输入搜索关键词');
          return;
        }

        // 切换状态
        document.getElementById('patentEmptyState').classList.add('hidden');
        document.getElementById('patentResultsList').classList.add('hidden');
        document.getElementById('patentLoadingState').classList.remove('hidden');
        document.getElementById('patentResultsCount').classList.add('hidden');
        
        const btn = document.getElementById('patentSearchBtn');
        const originalBtnText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ 检索中...</span>';

        try {
          const API_KEY = 'sk-FzKiwsI5ripsPdKfbAAtHdbKq8CtuQXSx5Mc7IxjbXLl3s3J';
          const API_URL = 'https://api.302.ai/serpapi/search';

          const response = await fetch(`${API_URL}?q=${encodeURIComponent(keyword + ' 专利')}&api_key=${API_KEY}&engine=google&num=10&tbm=pts`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });

          if (!response.ok) throw new Error('API请求失败: ' + response.status);

          const data = await response.json();
          const results = data.organic_results || [];
          
          // 保存结果供导出使用
          window.currentPatentResults = results;

          renderPatentResults(results, keyword);

        } catch (error) {
          console.error('搜索错误:', error);
          document.getElementById('patentResultsList').innerHTML = `
            <div class="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p class="text-red-400 font-medium mb-2">搜索出错</p>
              <p class="text-sm text-red-300/70">${error.message}</p>
              <button onclick="performPatentSearch()" class="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">重试</button>
            </div>
          `;
          document.getElementById('patentResultsList').classList.remove('hidden');
        } finally {
          document.getElementById('patentLoadingState').classList.add('hidden');
          btn.disabled = false;
          btn.innerHTML = originalBtnText;
        }
      };

      // 渲染结果
      function renderPatentResults(results, keyword) {
        const listContainer = document.getElementById('patentResultsList');
        const countBadge = document.getElementById('patentResultsCount');
        
        if (results.length === 0) {
          listContainer.innerHTML = `
            <div class="text-center py-12">
              <p class="text-gray-400 text-lg">未找到相关专利</p>
              <p class="text-gray-500 text-sm mt-2">请尝试更换关键词或减少筛选条件</p>
            </div>
          `;
        } else {
          countBadge.textContent = results.length;
          countBadge.classList.remove('hidden');
          
          let html = '';
          
          // 添加AI分析摘要卡片
          html += `
            <div class="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-xl p-5 mb-6 relative overflow-hidden group">
              <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>
              </div>
              <h4 class="text-indigo-300 font-medium mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
                AI 智能分析
              </h4>
              <p class="text-sm text-indigo-100/80 leading-relaxed">
                为您找到 ${results.length} 项与"${keyword}"相关的专利技术。该领域近期技术活跃度较高，主要集中在${results[0]?.assignee || '相关企业'}等申请人。建议关注其核心权利要求及技术演进路线。
              </p>
            </div>
          `;

          // 结果列表
          results.forEach(item => {
            // 高亮关键词
            const snippet = (item.snippet || '').replace(new RegExp(keyword, 'gi'), '<span class="bg-yellow-500/20 text-yellow-200 px-1 rounded">$ கரிம</span>');
            
            html += `
              <div class="group bg-slate-800/40 border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-blue-900/10">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <a href="${item.link || '#'}" target="_blank" class="text-lg font-medium text-blue-400 hover:text-blue-300 hover:underline mb-2 block line-clamp-1">
                      ${item.title || '无标题'}
                    </a>
                    <div class="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                      ${item.assignee ? `<span class="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">🏢 ${item.assignee}</span>` : ''}
                      ${item.filing_date ? `<span class="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">📅 ${item.filing_date}</span>` : ''}
                      ${item.patent_id ? `<span class="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">🆔 ${item.patent_id}</span>` : ''}
                    </div>
                    <p class="text-sm text-gray-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      ${snippet}
                    </p>
                  </div>
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <a href="${item.link || '#'}" target="_blank" class="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                      查看详情 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            `;
          });
          
          listContainer.innerHTML = html;
        }
        
        listContainer.classList.remove('hidden');
      }

      // 导出结果
      window.exportPatentResults = function() {
        const results = window.currentPatentResults || [];
        if (results.length === 0) {
          alert('暂无结果可导出');
          return;
        }
        
        const input = document.getElementById('patentKeywordInput');
        const keyword = input ? input.value.trim() : '专利';
        
        let csvContent = '\uFEFF标题,申请人,申请日,专利号,摘要,链接\n';
        results.forEach(r => {
          csvContent += [
            `"${(r.title || '').replace(/"/g, '""')}"`,
            `"${(r.assignee || '').replace(/"/g, '""')}"`,
            `"${(r.filing_date || '').replace(/"/g, '""')}"`,
            `"${(r.patent_id || '').replace(/"/g, '""')}"`,
            `"${(r.snippet || '').replace(/"/g, '""')}"`,
            `"${(r.link || '').replace(/"/g, '""')}"`
          ].join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `专利搜索_${keyword}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
      };