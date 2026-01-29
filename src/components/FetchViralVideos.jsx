import React, { useState } from 'react';
import {
  Video,
  Search,
  Loader2,
  Download,
  TrendingUp,
  Flame,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Filter,
  Clock,
  Hash,
  AlertCircle,
  Film
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const FetchViralVideos = () => {
  const config = useSystemConfig();
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [minLikes, setMinLikes] = useState('10000');
  const [isFetching, setIsFetching] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(null);

  const platforms = [
    { id: 'all', name: '全部平台', icon: Video },
    { id: 'douyin', name: '抖音', icon: Video },
    { id: 'kuaishou', name: '快手', icon: Video },
    { id: 'bilibili', name: 'B站', icon: Video },
    { id: 'xiaohongshu', name: '小红书', icon: Video },
  ];

  const timeRanges = [
    { id: '24h', name: '24小时' },
    { id: '7d', name: '7天' },
    { id: '30d', name: '30天' },
  ];

  const mockViralVideos = [
    {
      id: 1,
      title: '揭秘：如何用AI一天制作100条短视频',
      author: '科技创作者',
      avatar: '👨‍💻',
      platform: 'douyin',
      views: '2.3M',
      likes: '158K',
      comments: '8.2K',
      shares: '45K',
      duration: '3:45',
      publishTime: '2小时前',
      tags: ['AI工具', '短视频', '效率提升'],
      description: '分享我如何用AI工具一天高效制作100条短视频的经验，包含完整的工具链和操作流程...',
      url: 'https://example.com/video1'
    },
    {
      id: 2,
      title: '这个方法让我抖音涨粉100万！',
      author: '运营达人',
      avatar: '👩‍💼',
      platform: 'douyin',
      views: '5.1M',
      likes: '324K',
      comments: '15K',
      shares: '89K',
      duration: '5:20',
      publishTime: '5小时前',
      tags: ['涨粉技巧', '运营', '干货'],
      description: '从0到100万粉丝的完整攻略，告诉你如何快速起号、打造爆款内容...',
      url: 'https://example.com/video2'
    },
    {
      id: 3,
      title: '2024最火的AI视频生成工具测评',
      author: 'AI评测师',
      avatar: '🤖',
      platform: 'bilibili',
      views: '890K',
      likes: '67K',
      comments: '3.2K',
      shares: '12K',
      duration: '12:30',
      publishTime: '1天前',
      tags: ['AI', '视频生成', '工具测评'],
      description: '深度测评市面上主流的AI视频生成工具，帮你找到最适合的那一个...',
      url: 'https://example.com/video3'
    },
    {
      id: 4,
      title: '零基础学剪辑，这5个技巧就够了',
      author: '剪辑大神',
      avatar: '🎬',
      platform: 'xiaohongshu',
      views: '456K',
      likes: '38K',
      comments: '1.8K',
      shares: '8.5K',
      duration: '8:15',
      publishTime: '3天前',
      tags: ['剪辑', '教程', '新手'],
      description: '剪辑其实很简单！掌握这5个核心技巧，新手也能做出大片级别的视频...',
      url: 'https://example.com/video4'
    },
  ];

  const handleFetch = async () => {
    if (!keyword.trim()) {
      alert('请输入关键词');
      return;
    }

    setIsFetching(true);
    setResults([]);

    try {
      trackUserActivity('fetch_viral_videos', 'fetch', {
        keyword,
        platform,
        timeRange,
        minLikes
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const systemPrompt = `你是一位短视频内容分析和推荐专家。你擅长分析爆款视频的特点和规律。

## 你的任务
根据用户输入的关键词，分析并提供关于该主题下爆款视频的洞察。

## 你需要提供
1. **爆款特征分析**：该主题下爆款视频的共同特点
2. **内容方向建议**：如何制作该主题下的爆款内容
3. **热门标签推荐**：相关的热门话题标签
4. **发布时机建议**：最佳发布时间和频率
5. **避坑指南**：制作该主题视频需要注意的事项

请以结构化的方式输出分析结果。`;

      const userPrompt = `我想找关于"${keyword}"的爆款视频，请帮我分析：
- 平台：${platforms.find(p => p.id === platform)?.name || '全部'}
- 时间范围：${timeRanges.find(t => t.id === timeRange)?.name}
- 最低点赞数：${minLikes}

请提供关于该主题爆款视频的详细分析和建议。`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '分析失败');
      }

      const analysis = data.choices?.[0]?.message?.content || '未获取到分析结果';

      // Simulate results after a delay
      setTimeout(() => {
        setResults({
          analysis: analysis,
          videos: mockViralVideos.filter(v =>
            keyword.split(' ').some(k =>
              v.title.toLowerCase().includes(k.toLowerCase()) ||
              v.tags.some(t => t.toLowerCase().includes(k.toLowerCase())) ||
              v.description.toLowerCase().includes(k.toLowerCase())
            ) || true // Show all for demo
          ),
          timestamp: new Date().toISOString()
        });
        setIsFetching(false);
      }, 2000);

    } catch (error) {
      console.error('Fetch error:', error);
      alert(`分析失败: ${error.message}`);
      setIsFetching(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    trackUserActivity('fetch_viral_videos', 'copy', { videoId: id });
  };

  const handleVisitVideo = (video) => {
    trackUserActivity('fetch_viral_videos', 'visit', { videoId: video.id });
    window.open(video.url, '_blank');
  };

  const getPlatformColor = (platform) => {
    const colors = {
      douyin: 'from-black to-gray-800',
      kuaishou: 'from-orange-500 to-orange-600',
      bilibili: 'from-blue-500 to-cyan-500',
      xiaohongshu: 'from-red-500 to-pink-500'
    };
    return colors[platform] || 'from-gray-700 to-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Flame size={20} />
          </span>
          一键抓取爆款视频
        </h2>
        <p className="text-gray-400 max-w-2xl">
          智能分析各平台爆款视频特征，提供创作方向和避坑指南。
        </p>
      </div>

      {/* Search Panel */}
      <div className="bg-ai-card border border-white/5 rounded-2xl p-6 space-y-6">
        {/* Keyword Input */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Search size={16} className="text-orange-400" />
              关键词搜索
            </div>
            <PromptOptimizer
              value={keyword}
              onOptimized={setKeyword}
              featureKey="一键抓取爆款视频"
              featureContext="当前使用爆款视频搜索功能，优化关键词使其更能匹配热门内容，添加同义词、相关话题标签等。"
              buttonClassName="text-xs px-2 py-1"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="输入要搜索的关键词，例如：AI工具、短视频教程、美食制作..."
              className="w-full px-4 py-3 pl-11 bg-ai-dark/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </section>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Platform */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">选择平台</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-2.5 bg-ai-dark/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            >
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">时间范围</label>
            <div className="flex gap-2">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    timeRange === range.id
                      ? 'bg-orange-500/20 border border-orange-500/50 text-white'
                      : 'bg-ai-dark/50 border border-white/5 text-gray-400'
                  }`}
                >
                  {range.name}
                </button>
              ))}
            </div>
          </div>

          {/* Min Likes */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">最低点赞</label>
            <select
              value={minLikes}
              onChange={(e) => setMinLikes(e.target.value)}
              className="w-full px-4 py-2.5 bg-ai-dark/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="1000">1K+</option>
              <option value="10000">10K+</option>
              <option value="50000">50K+</option>
              <option value="100000">100K+</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleFetch}
          disabled={isFetching || !keyword.trim()}
          className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            isFetching || !keyword.trim()
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/25 hover:scale-[1.01]'
          }`}
        >
          {isFetching ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              正在分析爆款...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              开始分析
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">AI爆款分析</h3>
            </div>
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {results.analysis}
            </div>
          </div>

          {/* Video Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-400" />
                <h3 className="text-lg font-semibold text-white">
                  找到 {results.videos.length} 个爆款视频
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-ai-card border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group"
                >
                  {/* Video Thumbnail Placeholder */}
                  <div className={`h-40 bg-gradient-to-br ${getPlatformColor(video.platform)} relative flex items-center justify-center`}>
                    <Film size={48} className="text-white/30" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h4 className="text-white font-medium line-clamp-2 mb-2">{video.title}</h4>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{video.description}</p>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {video.avatar}
                      </span>
                      <span className="text-sm text-gray-400">{video.author}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {video.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{video.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={12} />
                        <span>{video.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{video.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{video.publishTime}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(video.url, video.id)}
                        className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copied === video.id ? (
                          <>
                            <Check size={14} className="text-green-400" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            复制链接
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleVisitVideo(video)}
                        className="flex-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        查看视频
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!results && !isFetching && (
        <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400 space-y-1">
              <div className="text-white font-medium">使用提示</div>
              <div>• 输入关键词后，AI会分析该主题下爆款视频的特征和规律</div>
              <div>• 支持抖音、快手、B站、小红书等主流平台</div>
              <div>• 可按时间范围和点赞数筛选，找到最适合的爆款参考</div>
              <div>• 分析结果包含爆款特征、内容方向、热门标签等建议</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchViralVideos;
