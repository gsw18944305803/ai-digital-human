import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Star,
  Copy,
  Check,
  Code,
  Image,
  Video,
  Mic,
  MapPin,
  Cloud,
  Database,
  FileText,
  Sparkles,
  Filter,
  TrendingUp,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { trackUserActivity } from '../services/userActivityService';

const GlobalFreeAPIs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copied, setCopied] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: '全部', icon: Globe },
    { id: 'ai', name: 'AI服务', icon: Sparkles },
    { id: 'image', name: '图像处理', icon: Image },
    { id: 'video', name: '视频服务', icon: Video },
    { id: 'audio', name: '音频服务', icon: Mic },
    { id: 'data', name: '数据服务', icon: Database },
    { id: 'tools', name: '开发工具', icon: Code },
    { id: 'location', name: '地理位置', icon: MapPin },
    { id: 'other', name: '其他', icon: Cloud },
  ];

  const apis = useMemo(() => [
    // AI Services
    {
      id: 1,
      name: 'Hugging Face',
      category: 'ai',
      description: '海量AI模型API，包括NLP、CV、语音等',
      url: 'https://huggingface.co/api',
      docs: 'https://huggingface.co/docs/api-inference',
      freeQuota: '免费额度有限',
      rating: 4.9,
      popularity: 95,
      tags: ['AI', '模型', '机器学习', 'NLP'],
      requiresAuth: false
    },
    {
      id: 2,
      name: 'OpenAI API',
      category: 'ai',
      description: 'GPT系列模型API，强大的文本生成和理解',
      url: 'https://api.openai.com',
      docs: 'https://platform.openai.com/docs',
      freeQuota: '新用户$5免费额度',
      rating: 4.8,
      popularity: 98,
      tags: ['AI', 'GPT', 'LLM', '文本生成'],
      requiresAuth: true
    },
    {
      id: 3,
      name: 'Claude API',
      category: 'ai',
      description: 'Anthropic的AI助手API，安全可靠',
      url: 'https://api.anthropic.com',
      docs: 'https://docs.anthropic.com',
      freeQuota: '有免费试用额度',
      rating: 4.7,
      popularity: 90,
      tags: ['AI', 'Claude', 'LLM'],
      requiresAuth: true
    },
    {
      id: 4,
      name: 'Google Gemini',
      category: 'ai',
      description: 'Google的多模态AI模型API',
      url: 'https://ai.google.dev',
      docs: 'https://ai.google.dev/docs',
      freeQuota: '每分钟60次免费请求',
      rating: 4.6,
      popularity: 88,
      tags: ['AI', 'Gemini', '多模态'],
      requiresAuth: true
    },

    // Image Processing
    {
      id: 10,
      name: 'Unsplash',
      category: 'image',
      description: '高质量免费图片搜索API',
      url: 'https://api.unsplash.com',
      docs: 'https://unsplash.com/documentation',
      freeQuota: '每小时50次请求',
      rating: 4.8,
      popularity: 92,
      tags: ['图片', '摄影', '免费素材'],
      requiresAuth: true
    },
    {
      id: 11,
      name: 'Pexels',
      category: 'image',
      description: '免费视频和图片API',
      url: 'https://api.pexels.com',
      docs: 'https://www.pexels.com/api/',
      freeQuota: '每月200次请求',
      rating: 4.7,
      popularity: 89,
      tags: ['图片', '视频', '素材'],
      requiresAuth: true
    },
    {
      id: 12,
      name: 'Placekitten',
      category: 'image',
      description: '猫咪占位图API（无需key）',
      url: 'https://placekitten.com',
      docs: 'https://placekitten.com',
      freeQuota: '完全免费',
      rating: 4.2,
      popularity: 75,
      tags: ['占位图', '猫咪', '无需key'],
      requiresAuth: false
    },

    // Video Services
    {
      id: 20,
      name: 'YouTube Data API',
      category: 'video',
      description: 'YouTube视频数据、搜索、评论等',
      url: 'https://www.googleapis.com/youtube/v3',
      docs: 'https://developers.google.com/youtube/v3',
      freeQuota: '每天10000单位',
      rating: 4.7,
      popularity: 95,
      tags: ['视频', 'YouTube', '搜索'],
      requiresAuth: true
    },
    {
      id: 21,
      name: 'Vimeo API',
      category: 'video',
      description: 'Vimeo视频平台API',
      url: 'https://api.vimeo.com',
      docs: 'https://developer.vimeo.com/api',
      freeQuota: '有免费额度限制',
      rating: 4.5,
      popularity: 82,
      tags: ['视频', 'Vimeo'],
      requiresAuth: true
    },

    // Audio Services
    {
      id: 30,
      name: 'Free Sound API',
      category: 'audio',
      description: '免费音效库API',
      url: 'https://freesound.org',
      docs: 'https://freesound.org/docs/api/',
      freeQuota: '有访问限制',
      rating: 4.6,
      popularity: 85,
      tags: ['音效', '声音', '免费'],
      requiresAuth: true
    },

    // Data Services
    {
      id: 40,
      name: 'JSONPlaceholder',
      category: 'data',
      description: '假数据REST API（测试用）',
      url: 'https://jsonplaceholder.typicode.com',
      docs: 'https://jsonplaceholder.typicode.com',
      freeQuota: '完全免费',
      rating: 4.9,
      popularity: 93,
      tags: ['测试数据', 'REST', '无需key'],
      requiresAuth: false
    },
    {
      id: 41,
      name: 'Random User API',
      category: 'data',
      description: '随机生成用户数据',
      url: 'https://randomuser.me/api',
      docs: 'https://randomuser.me/documentation',
      freeQuota: '完全免费',
      rating: 4.7,
      popularity: 87,
      tags: ['测试数据', '用户信息'],
      requiresAuth: false
    },
    {
      id: 42,
      name: 'CoinGecko',
      category: 'data',
      description: '加密货币价格API',
      url: 'https://api.coingecko.com/api/v3',
      docs: 'https://www.coingecko.com/en/api',
      freeQuota: '每分钟50次',
      rating: 4.8,
      popularity: 90,
      tags: ['加密货币', '价格', '金融'],
      requiresAuth: false
    },

    // Development Tools
    {
      id: 50,
      name: 'GitHub API',
      category: 'tools',
      description: 'GitHub开发者API',
      url: 'https://api.github.com',
      docs: 'https://docs.github.com/en/rest',
      freeQuota: '每小时5000次',
      rating: 4.9,
      popularity: 97,
      tags: ['GitHub', '代码', '开发'],
      requiresAuth: false
    },
    {
      id: 51,
      name: 'GitLab API',
      category: 'tools',
      description: 'GitLab开发者API',
      url: 'https://gitlab.com/api/v4',
      docs: 'https://docs.gitlab.com/ee/api/',
      freeQuota: '有速率限制',
      rating: 4.6,
      popularity: 84,
      tags: ['GitLab', '代码', 'CI/CD'],
      requiresAuth: false
    },
    {
      id: 52,
      name: 'Pastebin API',
      category: 'tools',
      description: '代码分享API',
      url: 'https://pastebin.com/api',
      docs: 'https://pastebin.com/api',
      freeQuota: '有访问限制',
      rating: 4.3,
      popularity: 78,
      tags: ['代码分享', '文本'],
      requiresAuth: true
    },

    // Location Services
    {
      id: 60,
      name: 'IP-API',
      category: 'location',
      description: 'IP地理位置查询（无需key）',
      url: 'http://ip-api.com/json',
      docs: 'http://ip-api.com/docs',
      freeQuota: '每分钟45次',
      rating: 4.7,
      popularity: 91,
      tags: ['IP', '地理位置', '无需key'],
      requiresAuth: false
    },
    {
      id: 61,
      name: 'OpenStreetMap Nominatim',
      category: 'location',
      description: '地理编码和地图搜索',
      url: 'https://nominatim.openstreetmap.org',
      docs: 'https://nominatim.org/release-docs/latest/api/',
      freeQuota: '每秒1次',
      rating: 4.5,
      popularity: 86,
      tags: ['地图', '地理编码', '开源'],
      requiresAuth: false
    },

    // Other
    {
      id: 70,
      name: 'Chuck Norris Jokes',
      category: 'other',
      description: '随机笑话API',
      url: 'https://api.chucknorris.io/jokes/random',
      docs: 'https://api.chucknorris.io',
      freeQuota: '完全免费',
      rating: 4.4,
      popularity: 80,
      tags: ['笑话', '娱乐'],
      requiresAuth: false
    },
    {
      id: 71,
      name: 'Advice Slip',
      category: 'other',
      description: '随机建议API',
      url: 'https://api.adviceslip.com',
      docs: 'https://api.adviceslip.com',
      freeQuota: '完全免费',
      rating: 4.3,
      popularity: 76,
      tags: ['建议', '励志'],
      requiresAuth: false
    },
    {
      id: 72,
      name: 'QR Code API',
      category: 'other',
      description: '生成二维码API',
      url: 'https://api.qrserver.com/v1/create-qr-code',
      docs: 'https://goqr.me/api/',
      freeQuota: '完全免费',
      rating: 4.6,
      popularity: 88,
      tags: ['二维码', '生成'],
      requiresAuth: false
    },
  ], []);

  const filteredAndSortedAPIs = useMemo(() => {
    let filtered = apis;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(api => api.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(api =>
        api.name.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query) ||
        api.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'popular') {
        return b.popularity - a.popularity;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return sorted;
  }, [apis, selectedCategory, searchQuery, sortBy]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    trackUserActivity('free_apis', 'copy', { apiId: id });
  };

  const handleVisitAPI = (api) => {
    trackUserActivity('free_apis', 'visit', { apiId: api.id, apiName: api.name });
    window.open(api.docs, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Globe size={20} />
          </span>
          全球免费API汇总
        </h2>
        <p className="text-gray-400 max-w-2xl">
          精选全球优质免费API资源，涵盖AI、图像、视频、数据等各类服务。
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索API名称、描述或标签..."
            className="w-full pl-12 pr-4 py-3 bg-ai-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-500/20 border border-teal-500/50 text-white'
                  : 'bg-ai-card border border-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            找到 {filteredAndSortedAPIs.length} 个API
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-ai-card border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-teal-500/50"
            >
              <option value="popular">按热度</option>
              <option value="rating">按评分</option>
              <option value="name">按名称</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedAPIs.map((api) => (
          <div
            key={api.id}
            className="bg-ai-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-medium flex items-center gap-2">
                  {api.name}
                  {api.requiresAuth && (
                    <Shield size={14} className="text-yellow-500" title="需要API密钥" />
                  )}
                  {!api.requiresAuth && (
                    <Zap size={14} className="text-green-500" title="无需API密钥" />
                  )}
                </h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{api.description}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {api.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={12} fill="currentColor" />
                <span>{api.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-teal-500">
                <TrendingUp size={12} />
                <span>{api.popularity}%热度</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <Clock size={12} />
                <span className="text-gray-500">{api.freeQuota}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(api.url, api.id)}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                {copied === api.id ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    复制URL
                  </>
                )}
              </button>
              <button
                onClick={() => handleVisitAPI(api)}
                className="flex-1 px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} />
                查看文档
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedAPIs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-600" />
          </div>
          <p className="text-gray-500">没有找到匹配的API</p>
          <p className="text-sm text-gray-600 mt-1">尝试调整搜索词或选择其他分类</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-400 space-y-1">
            <div className="text-white font-medium">使用提示</div>
            <div>• 点击"复制URL"获取API地址，点击"查看文档"访问官方文档</div>
            <div>• 部分API需要注册获取密钥，部分可直接使用</div>
            <div>• 免费额度有限，建议查看官方文档了解具体限制</div>
            <div>• 如发现API不可用或信息有误，请联系我们更新</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalFreeAPIs;
