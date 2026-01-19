import React, { useState } from 'react';
import { 
  Link, 
  FileText, 
  ThumbsUp, 
  MessageCircle, 
  Star, 
  Share2, 
  Loader2, 
  Mic, 
  Search, 
  Play,
  Copy,
  Check
} from 'lucide-react';

const MultiPlatformVideoExtractor = () => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [data, setData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleExtract = () => {
    if (!url) return;
    
    setIsExtracting(true);
    setData(null);

    // Simulate API call
    setTimeout(() => {
      // Mock data based on platform detection (simple heuristic)
      const isDouyin = url.includes('douyin');
      
      setData({
        platform: isDouyin ? '抖音' : '小红书',
        author: isDouyin ? '职场进阶指南' : '生活美学家',
        title: isDouyin ? '5分钟教你如何高效复盘' : '沉浸式居家办公vlog | 提升幸福感的好物',
        cover: '', // In a real app, this would be a URL
        stats: {
          likes: isDouyin ? '45.2w' : '1.2w',
          comments: isDouyin ? '3.4w' : '856',
          favorites: isDouyin ? '12.8w' : '5.6w',
          shares: isDouyin ? '8.9w' : '1.2k'
        },
        copy: isDouyin 
          ? "为什么你总是瞎忙？因为不懂复盘！\n今天分享3个我用了5年的复盘模板，建议点赞收藏反复观看！\n#职场 #复盘 #个人成长 #效率工具"
          : "终于把书房收拾成了理想的样子✨\n换了新的升降桌，加上喜欢的绿植，工作效率up up！\n今天的阳光也超好，忍不住拍了个vlog记录一下~\n#书房改造 #沉浸式 #居家办公 #提升幸福感",
        audioTranscript: isDouyin
          ? "00:01 很多人问我，为什么每天工作12小时还是没有产出？\n00:05 其实不是你不够努力，而是你没有建立复盘机制。\n00:10 大家好，我是Alex。今天给大家分享三个复盘模型。\n00:15 第一个是KISS模型，Keep保持，Improve改进，Start开始，Stop停止...\n00:45 只要坚持每天花5分钟填写这个表格，你的成长速度会是别人的三倍。"
          : "00:00 (轻音乐)\n00:05 今天天气真的很好，早上起来先给自己煮了一杯咖啡。\n00:15 这里的柜子是我新买的，用来收纳杂物非常方便。\n00:30 其实生活中的仪式感不需要很贵，一束花，一个干净的桌面就够了。\n00:50 看着整理好的房间，心情真的会变好很多。"
      });
      setIsExtracting(false);
    }, 2000);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Link size={18} />
          </span>
          多平台视频数据一键提取
        </h2>
        <p className="text-sm text-gray-400 max-w-2xl">
          支持小红书、抖音视频链接解析。一键提取视频文案、音频转写内容及互动数据，辅助内容创作与分析。
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-ai-card border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请粘贴小红书或抖音视频链接 (例如: https://www.xiaohongshu.com/...)"
              className="block w-full pl-11 pr-4 py-4 bg-ai-dark/50 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !url}
            className={`px-8 py-4 rounded-xl font-medium text-white shadow-lg transition-all flex items-center gap-2 justify-center min-w-[160px] ${
              isExtracting || !url
                ? 'bg-gray-700/50 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>提取中...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>开始提取</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            系统状态正常
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">dou</span>
            支持抖音
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">红</span>
            支持小红书
          </span>
        </div>
      </div>

      <div className="bg-ai-card border border-dashed border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-200">当前数据预览</h3>
          <span className="text-xs text-gray-500">
            {data ? '已从最新解析结果填充' : '解析完成后将自动填充数据'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">文案</div>
              <div className="text-sm text-gray-200 line-clamp-1">
                {data ? data.title : '暂无数据'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">内容</div>
              <div className="text-sm text-gray-300 line-clamp-2">
                {data ? data.copy : '暂无数据，请先在上方粘贴链接并点击开始提取'}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: '点赞数', key: 'likes' },
              { label: '评论数', key: 'comments' },
              { label: '收藏数', key: 'favorites' },
              { label: '转发数', key: 'shares' },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-ai-dark/40 border border-white/5 rounded-xl px-3 py-2 flex flex-col gap-1"
              >
                <span className="text-[11px] text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-white">
                  {data ? data.stats[item.key] : '--'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {/* Left Column: Stats & Copy */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '点赞', value: data.stats.likes, icon: ThumbsUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                { label: '评论', value: data.stats.comments, icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: '收藏', value: data.stats.favorites, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: '转发', value: data.stats.shares, icon: Share2, color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-ai-card border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center ${stat.color} mb-1`}>
                    <stat.icon size={16} />
                  </div>
                  <span className="text-lg font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Video Copy */}
            <div className="bg-ai-card border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[300px]">
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-400" />
                  <h3 className="font-medium text-gray-200">视频文案</h3>
                </div>
                <button 
                  onClick={() => copyToClipboard(data.copy, 'copy')}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="复制文案"
                >
                  {copiedField === 'copy' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {data.copy}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Audio Transcript */}
          <div className="lg:col-span-1">
            <div className="bg-ai-card border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic size={18} className="text-purple-400" />
                  <h3 className="font-medium text-gray-200">音频转文字内容</h3>
                </div>
                <button 
                  onClick={() => copyToClipboard(data.audioTranscript, 'transcript')}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="复制内容"
                >
                  {copiedField === 'transcript' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar bg-ai-dark/30">
                <div className="space-y-4">
                  {data.audioTranscript.split('\n').map((line, index) => {
                    const match = line.match(/^(\d{2}:\d{2})\s+(.+)$/);
                    if (match) {
                      return (
                        <div key={index} className="flex gap-3 group">
                          <span className="text-xs font-mono text-gray-500 pt-1 select-none group-hover:text-indigo-400 transition-colors">
                            {match[1]}
                          </span>
                          <p className="text-sm text-gray-300 flex-1 leading-relaxed">
                            {match[2]}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="text-sm text-gray-300 leading-relaxed">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
              <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
                 <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 w-full py-1">
                    <Play size={12} />
                    <span>试听原声音频</span>
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiPlatformVideoExtractor;
