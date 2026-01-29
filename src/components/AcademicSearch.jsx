import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { academicService } from '../services/writingService';
import { Search, BookOpen, ExternalLink, Loader2, FileText, Calendar, Users, GraduationCap } from 'lucide-react';

const AcademicSearch = () => {
  const config = useSystemConfig();
  const featureConfig = config.features['AI学术论文搜索'];

  const [query, setQuery] = useState('');
  const [source, setSource] = useState('arxiv'); // 'arxiv' | 'google'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const url = source === 'google' ? featureConfig.googleUrl : featureConfig.apiUrl;
      const res = await academicService.search(featureConfig.apiKey, url, query, 10);

      console.log('📚 API响应:', res);

      // 处理不同的响应格式
      let papersList = [];
      if (res.data && res.data.olist) {
        // Arxiv/Google标准格式: { data: { olist: [...] } }
        papersList = res.data.olist;
      } else if (res.data && Array.isArray(res.data)) {
        // 直接数组格式: { data: [...] }
        papersList = res.data;
      } else if (Array.isArray(res)) {
        // 顶层数组格式: [...]
        papersList = res;
      } else {
        console.warn('未知的响应格式:', res);
      }

      console.log('📚 papersList:', papersList);
      console.log('📚 papersList.length:', papersList.length);

      // 格式化论文数据，统一字段名
      const formattedResults = papersList.map(paper => {
        // 处理作者字段：检查是否有有效内容
        let authors = '';
        if (paper.authors && typeof paper.authors === 'string' && paper.authors.trim()) {
          authors = paper.authors;
        }

        // 处理年份：可能是时间戳或年份字符串
        let year = '';
        if (paper.published) {
          year = new Date(paper.published * 1000).getFullYear().toString();
        } else if (paper.year) {
          year = paper.year.toString();
        } else if (paper.updated) {
          year = new Date(paper.updated * 1000).getFullYear().toString();
        }

        return {
          title: paper.title || '无标题',
          abstract: paper.summary || paper.abstract || '',
          authors: authors,
          year: year,
          pdf_url: paper.pdf_url || paper.pdfUrl,
          url: paper.link || paper.url || paper.arxiv_url || paper.id
        };
      });

      setResults(formattedResults);

      if (formattedResults.length === 0) {
        console.log('未找到相关论文');
      }
    } catch (err) {
      console.error('搜索错误:', err);
      alert(`搜索失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!featureConfig?.apiKey) {
    return <div className="p-10 text-center text-gray-500">请联系管理员配置 API Key</div>;
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-6">
       {/* 头部 */}
       <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI 学术论文搜索</h1>
            <p className="text-sm text-gray-500">聚合 Arxiv 与 Google Scholar 的学术资源，快速查找相关论文</p>
          </div>
       </div>

       {/* 搜索区域 */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* 数据源选择 */}
          <div className="flex gap-4 mb-6 justify-center">
             <button
               onClick={() => setSource('arxiv')}
               className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${source === 'arxiv' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               📚 Arxiv
             </button>
             <button
               onClick={() => setSource('google')}
               className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${source === 'google' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               🔍 Google Scholar
             </button>
          </div>

          {/* 搜索框 */}
          <div className="relative max-w-3xl mx-auto">
             <input
               type="text"
               value={query}
               onChange={e => setQuery(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSearch()}
               className="w-full p-5 pl-14 pr-36 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg text-gray-900 bg-white placeholder-gray-400 transition-all"
               placeholder="输入论文关键词、标题或作者... 例如：deep learning, computer vision"
             />
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
             <button
               onClick={handleSearch}
               disabled={loading || !query.trim()}
               className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center gap-2"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
               {loading ? '搜索中...' : '搜索'}
             </button>
          </div>

          {/* 提示信息 */}
          {source === 'arxiv' && (
             <p className="text-center text-sm text-gray-500 mt-4">
               💡 Arxiv 是最权威的预印本论文库，涵盖物理、数学、计算机科学等领域
             </p>
          )}
          {source === 'google' && (
             <p className="text-center text-sm text-gray-500 mt-4">
               💡 Google Scholar 覆盖全球学术资源，包含期刊论文、学位论文、会议论文等
             </p>
          )}
       </div>

       {/* 结果区域 */}
       <div className="flex-1 overflow-y-auto">
          {loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-500">AI</span>
                      </div>
                  </div>
                  <p className="text-gray-600 mt-4">正在搜索论文...</p>
              </div>
          )}

          {!loading && results.length > 0 && (
              <div className="space-y-4">
                  <div className="text-sm text-gray-600 font-medium">
                     找到 <span className="text-blue-600 font-bold">{results.length}</span> 篇相关论文
                  </div>
                  {results.map((paper, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all">
                          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-start gap-2">
                             <BookOpen size={22} className="mt-1 flex-shrink-0" />
                             <span className="underline">{paper.title}</span>
                          </h3>

                          {/* 作者和年份 */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                             {paper.authors && paper.authors.length > 0 && (
                                 <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span>{Array.isArray(paper.authors) ? paper.authors.slice(0, 5).join(', ') + (paper.authors.length > 5 ? ' 等' : '') : paper.authors}</span>
                                 </div>
                             )}
                             {(paper.year || paper.date) && (
                                 <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{paper.year || paper.date}</span>
                                 </div>
                             )}
                          </div>

                          {/* 摘要 */}
                          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                             {paper.abstract || paper.summary || '暂无摘要...'}
                          </p>

                          {/* 操作按钮 */}
                          <div className="flex flex-wrap gap-3">
                             {paper.pdf_url && (
                                 <a href={paper.pdf_url} target="_blank" rel="noreferrer" className="text-sm px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 flex items-center gap-2 transition-colors">
                                    <FileText size={16} />
                                    PDF 下载 <ExternalLink size={14} />
                                 </a>
                             )}
                             {paper.url && (
                                 <a href={paper.url} target="_blank" rel="noreferrer" className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2 transition-colors">
                                    原文链接 <ExternalLink size={14} />
                                 </a>
                             )}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {!loading && results.length === 0 && query && (
              <div className="text-center text-gray-500 mt-20">
                  <Search size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">未找到相关论文</p>
                  <p className="text-sm mt-2">请尝试使用不同的关键词搜索</p>
              </div>
          )}

          {!loading && !query && (
              <div className="text-center text-gray-400 mt-20">
                  <GraduationCap size={80} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">输入关键词开始搜索</p>
                  <p className="text-sm mt-2">支持搜索论文标题、作者、研究领域等</p>
              </div>
          )}
       </div>
    </div>
  );
};

export default AcademicSearch;
