import React, { useState } from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  Video, 
  Loader2, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Download,
  ShoppingBag,
  Utensils,
  Shirt,
  Laptop,
  Home,
  GraduationCap,
  Layers
} from 'lucide-react';

const MarketingGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [industry, setIndustry] = useState('');
  const [outputType, setOutputType] = useState('poster'); // 'poster' | 'video'
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [showOptimizationResult, setShowOptimizationResult] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  const industries = [
    { id: 'food', name: '餐饮美食', icon: Utensils },
    { id: 'fashion', name: '服装时尚', icon: Shirt },
    { id: 'tech', name: '数码科技', icon: Laptop },
    { id: 'beauty', name: '美妆护肤', icon: Sparkles },
    { id: 'realestate', name: '房产家居', icon: Home },
    { id: 'education', name: '教育培训', icon: GraduationCap },
    { id: 'other', name: '其他行业', icon: Layers },
  ];

  const handleOptimize = () => {
    if (!prompt) return;
    setIsOptimizing(true);
    // Simulate API call
    setTimeout(() => {
      const prefix = outputType === 'poster' ? '高清海报，商业摄影，' : '电影级运镜，4k画质，';
      setOptimizedPrompt(`${prefix}${industry ? industry + '行业，' : ''}${prompt}，极简主义构图，柔和光影，高级感配色，8k分辨率，细节丰富`);
      setIsOptimizing(false);
      setShowOptimizationResult(true);
    }, 1500);
  };

  const applyOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowOptimizationResult(false);
  };

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResult(null);
    
    // Simulate generation
    setTimeout(() => {
      setResult({
        type: outputType,
        url: outputType === 'poster' 
          ? 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000' 
          : 'https://assets.mixkit.co/videos/preview/mixkit-coffee-beans-falling-slowly-4395-large.mp4' // Placeholder video
      });
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Sparkles size={20} />
          </span>
          宣传海报、视频制作
        </h2>
        <p className="text-gray-400 max-w-2xl">
          一站式智能营销物料生成。输入创意描述，选择行业风格，AI 自动为您生成高质量的宣传海报或商业视频。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Output Type Selection */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-400">1</span>
              选择生成类型
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setOutputType('poster')}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-3 group ${
                  outputType === 'poster'
                    ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-ai-card border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  outputType === 'poster' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                }`}>
                  <ImageIcon size={24} />
                </div>
                <div className="text-center">
                  <div className={`font-medium ${outputType === 'poster' ? 'text-white' : 'text-gray-300'}`}>宣传海报</div>
                  <div className="text-xs text-gray-500 mt-1">适用于朋友圈、电商详情页</div>
                </div>
                {outputType === 'poster' && (
                  <div className="absolute top-3 right-3 text-orange-500">
                    <Check size={16} />
                  </div>
                )}
              </button>

              <button
                onClick={() => setOutputType('video')}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-3 group ${
                  outputType === 'video'
                    ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-ai-card border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  outputType === 'video' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                }`}>
                  <Video size={24} />
                </div>
                <div className="text-center">
                  <div className={`font-medium ${outputType === 'video' ? 'text-white' : 'text-gray-300'}`}>宣传视频</div>
                  <div className="text-xs text-gray-500 mt-1">适用于短视频平台、广告投放</div>
                </div>
                {outputType === 'video' && (
                  <div className="absolute top-3 right-3 text-blue-500">
                    <Check size={16} />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* 2. Industry Selection */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-400">2</span>
              选择所属行业
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.name)}
                  className={`px-3 py-3 rounded-xl border text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                    industry === ind.name
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-ai-card border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <ind.icon size={18} />
                  <span>{ind.name}</span>
                </button>
              ))}
            </div>
            {industry === '其他行业' && (
               <input 
                 type="text"
                 placeholder="请输入您的具体行业..."
                 className="w-full mt-2 px-4 py-3 bg-ai-card border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all"
                 onChange={(e) => setIndustry(e.target.value)}
               />
            )}
          </section>

          {/* 3. Prompt Input */}
          <section className="space-y-3">
             <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-400">3</span>
                  创意描述
                </div>
                <button
                  onClick={handleOptimize}
                  disabled={!prompt || isOptimizing}
                  className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:border-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOptimizing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Wand2 size={12} />
                  )}
                  智能优化提示词
                </button>
             </div>
             
             <div className="relative group">
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="描述您想要生成的画面内容，例如：一款高端香水的商业摄影，柔和的晨光，玫瑰花瓣点缀..."
                 className="w-full h-32 bg-ai-card border border-white/10 rounded-2xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all resize-none"
               />
               
               {/* Optimization Result Modal/Popover */}
               {showOptimizationResult && (
                 <div className="absolute top-full left-0 right-0 mt-2 z-10 animate-fade-in-up">
                   <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-4">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
                         <Sparkles size={12} /> AI 优化结果
                       </span>
                       <button onClick={() => setShowOptimizationResult(false)} className="text-gray-500 hover:text-white text-xs">
                         关闭
                       </button>
                     </div>
                     <p className="text-sm text-gray-300 mb-3 bg-white/5 p-3 rounded-lg border border-white/5">
                       {optimizedPrompt}
                     </p>
                     <div className="flex gap-2 justify-end">
                       <button 
                         onClick={() => setShowOptimizationResult(false)}
                         className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-white/5"
                       >
                         使用原词
                       </button>
                       <button 
                         onClick={applyOptimized}
                         className="px-3 py-1.5 rounded-lg text-xs bg-purple-500 text-white hover:bg-purple-600"
                       >
                         使用优化后
                       </button>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isGenerating || !prompt
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-orange-500/25 hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                正在生成中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                立即生成
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">效果预览</span>
              {result && (
                <div className="flex gap-2">
                   <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="重新生成">
                     <RefreshCw size={14} />
                   </button>
                   <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="下载">
                     <Download size={14} />
                   </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6 bg-ai-dark/30">
              {result ? (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl animate-fade-in relative group">
                  {result.type === 'poster' ? (
                    <img src={result.url} alt="Generated Poster" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black relative flex items-center justify-center">
                       {/* Mock Video Player */}
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                       <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform z-10">
                          <Video size={32} fill="currentColor" />
                       </div>
                       <span className="absolute bottom-4 left-4 text-white text-sm font-medium">宣传视频_001.mp4</span>
                    </div>
                  )}
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <button className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm hover:scale-105 transition-transform">
                        查看大图
                     </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                    {outputType === 'poster' ? <ImageIcon size={32} className="opacity-50" /> : <Video size={32} className="opacity-50" />}
                  </div>
                  <p className="text-sm">
                    {isGenerating ? 'AI 正在挥洒创意...' : '配置左侧参数后点击生成'}
                  </p>
                </div>
              )}
            </div>

            {/* Template Recommendations (Self-directed feature) */}
            {!result && !isGenerating && (
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <div className="text-xs font-medium text-gray-400 mb-3">推荐风格</div>
                <div className="grid grid-cols-3 gap-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="aspect-[3/4] rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 hover:border-orange-500/50 transition-all"></div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingGenerator;
