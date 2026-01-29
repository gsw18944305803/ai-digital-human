import React, { useState, useEffect } from 'react';
import { TrendingUp, ExternalLink, Github, Zap, Clock, RefreshCw, Filter } from 'lucide-react';

const RealTimeTrends = () => {
  const [activeTab, setActiveTab] = useState('github');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const sources = [
    { id: 'github', name: 'GitHub Trending', icon: Github, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'hackernews', name: 'Hacker News', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'producthunt', name: 'Product Hunt', icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  const fetchTrends = async (source) => {
    setLoading(true);
    try {
      // 模拟数据 - 实际应用中应该调用真实的 API
      const mockData = {
        github: [
          { id: 1, title: 'microsoft/vscode', desc: 'Visual Studio Code', stars: '150k+', language: 'TypeScript', url: '#' },
          { id: 2, title: 'facebook/react', desc: 'A declarative, efficient, and flexible JavaScript library', stars: '213k+', language: 'JavaScript', url: '#' },
          { id: 3, title: 'vercel/next.js', desc: 'The React Framework', stars: '110k+', language: 'JavaScript', url: '#' },
          { id: 4, title: 'microsoft/playwright', desc: 'Playwright is a framework for Web Testing', stars: '58k+', language: 'TypeScript', url: '#' },
          { id: 5, title: 'openai/openai-quickstart-python', desc: 'Python quickstart for the OpenAI API', stars: '5.2k+', language: 'Python', url: '#' },
        ],
        hackernews: [
          { id: 1, title: 'Show HN: I built a tool to...', desc: 'A new way to automate your workflow', points: 342, url: '#' },
          { id: 2, title: 'The future of web development', desc: 'An in-depth analysis of modern frameworks', points: 289, url: '#' },
          { id: 3, title: 'How we scaled to 10M users', desc: 'Technical lessons learned', points: 256, url: '#' },
          { id: 4, title: 'Understanding distributed systems', desc: 'A comprehensive guide', points: 198, url: '#' },
          { id: 5, title: 'The state of AI in 2024', desc: 'Industry trends and predictions', points: 176, url: '#' },
        ],
        producthunt: [
          { id: 1, title: 'AI写作助手', desc: '智能文案生成工具', upvotes: 523, tag: 'Productivity', url: '#' },
          { id: 2, title: 'CodeHelper Pro', desc: '开发者AI编程助手', upvotes: 489, tag: 'Developer Tools', url: '#' },
          { id: 3, title: 'TaskFlow', desc: '团队协作管理平台', upvotes: 412, tag: 'Productivity', url: '#' },
          { id: 4, title: 'DesignHub', desc: '在线设计协作工具', upvotes: 378, tag: 'Design', url: '#' },
          { id: 5, title: 'DataViz Pro', desc: '数据可视化分析平台', upvotes: 345, tag: 'Analytics', url: '#' },
        ],
      };

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      setTrends(mockData[source] || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    fetchTrends(activeTab);
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: 'text-yellow-400',
      TypeScript: 'text-blue-400',
      Python: 'text-green-400',
      Java: 'text-red-400',
      Go: 'text-cyan-400',
      Rust: 'text-orange-400',
    };
    return colors[language] || 'text-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="text-blue-500" />
          热点实时聚合
        </h2>
        <p className="text-sm text-gray-400">
          实时追踪 GitHub、Hacker News、Product Hunt 等平台的热门内容
        </p>
      </div>

      {/* Source Tabs */}
      <div className="bg-ai-card border border-white/5 rounded-xl p-2 inline-flex gap-2">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setActiveTab(source.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === source.id
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <source.icon size={16} />
            {source.name}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} />
          {lastUpdate ? (
            <span>最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
          ) : (
            <span>等待更新...</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            loading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Trends List */}
      <div className="bg-ai-card border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400">正在加载热点数据...</p>
            </div>
          </div>
        ) : trends.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">暂无热点数据</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {trends.map((trend, index) => (
              <a
                key={trend.id}
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors mb-1 flex items-center gap-2">
                          {trend.title}
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{trend.desc}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-3 mt-3">
                      {trend.language && (
                        <span className={`text-xs font-medium ${getLanguageColor(trend.language)}`}>
                          {trend.language}
                        </span>
                      )}
                      {trend.stars && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Zap size={12} />
                          {trend.stars}
                        </span>
                      )}
                      {trend.points && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Zap size={12} />
                          {trend.points} points
                        </span>
                      )}
                      {trend.upvotes && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <TrendingUp size={12} />
                          {trend.upvotes}
                        </span>
                      )}
                      {trend.tag && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                          {trend.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Zap className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="text-blue-300 font-medium mb-1">功能说明</p>
            <p className="text-gray-400">
              当前显示的是模拟数据。实际使用时，可以配置 API 接口获取真实的 GitHub Trending、Hacker News 和 Product Hunt 数据。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTrends;
