import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Loader2,
  Check,
  RefreshCw,
  Download,
  ShoppingBag,
  Utensils,
  Shirt,
  Laptop,
  Home,
  GraduationCap,
  Layers,
  X
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';

const MarketingGenerator = () => {
  const config = useSystemConfig();
  const [prompt, setPrompt] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // New state for tracking active button
  const [outputType, setOutputType] = useState('poster'); // 'poster' | 'video'
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const industries = [
    { id: 'food', name: '餐饮美食', icon: Utensils },
    { id: 'fashion', name: '服装时尚', icon: Shirt },
    { id: 'tech', name: '数码科技', icon: Laptop },
    { id: 'beauty', name: '美妆护肤', icon: Check },
    { id: 'realestate', name: '房产家居', icon: Home },
    { id: 'education', name: '教育培训', icon: GraduationCap },
    { id: 'other', name: '其他行业', icon: Layers },
  ];

  const downloadImage = async (url) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `marketing-asset-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResult(null);
    
    if (outputType === 'video') {
      // Keep mock for video as requested API is for images
      setTimeout(() => {
        setResult({
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-beans-falling-slowly-4395-large.mp4'
        });
        setIsGenerating(false);
      }, 3000);
      return;
    }

    try {
      // 302.ai OpenAI Compatible Image Generation (DALL-E 3)
      const fullPrompt = `${industry ? industry + '行业，' : ''}${prompt}`;
      
      const apiKey = config.models.image?.apiKey || config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.image?.apiUrl || 'https://api.302.ai/v1/images/generations';
      const modelName = config.models.image?.modelName || 'dall-e-3';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024"
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '生成失败');
      }

      if (data.data && data.data.length > 0) {
        setResult({
          type: 'poster',
          url: data.data[0].url
        });
      } else {
        throw new Error('未获取到图片数据');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
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
                  onClick={() => {
                    setSelectedCategory(ind.id);
                    if (ind.id === 'other') {
                      setIndustry(''); // Clear for manual input
                    } else {
                      setIndustry(ind.name);
                    }
                  }}
                  className={`px-3 py-3 rounded-xl border text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedCategory === ind.id
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-ai-card border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <ind.icon size={18} />
                  <span>{ind.name}</span>
                </button>
              ))}
            </div>
            {selectedCategory === 'other' && (
               <input 
                 type="text"
                 value={industry}
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
                <PromptOptimizer
                  value={prompt}
                  onOptimized={setPrompt}
                  featureKey="AI电商场景图生成"
                  featureContext={`当前使用AI电商场景图生成功能，${outputType === 'poster' ? '海报' : '视频'}模式，${industry ? `行业：${industry}` : ''}。优化时使描述更加详细、具体，添加场景、风格、光影、构图等商业摄影要素。`}
                  buttonClassName="text-xs px-2 py-1"
                />
             </div>

             <div className="relative group">
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="描述您想要生成的画面内容，例如：一款高端香水的商业摄影，柔和的晨光，玫瑰花瓣点缀..."
                 className="w-full h-32 bg-ai-card border border-white/10 rounded-2xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all resize-none"
               />
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
                   <button 
                     onClick={handleGenerate}
                     className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" 
                     title="重新生成"
                   >
                     <RefreshCw size={14} />
                   </button>
                   <button 
                     onClick={() => downloadImage(result.url)}
                     className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" 
                     title="下载"
                   >
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
                     <button 
                       onClick={() => setPreviewUrl(result.url)}
                       className="px-6 py-2 rounded-full bg-white text-black font-medium text-sm hover:scale-105 transition-transform"
                     >
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

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-7xl max-h-[90vh] p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 md:-top-12 md:right-0 p-2 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full md:bg-transparent"
            >
              <X size={24} />
            </button>
            
            {outputType === 'poster' ? (
              <img 
                src={previewUrl} 
                alt="Full Preview" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
               <video 
                 src={previewUrl} 
                 controls 
                 className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                 autoPlay
               />
            )}
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => downloadImage(previewUrl)}
                className="px-8 py-3 bg-white text-black rounded-full font-medium shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Download size={20} />
                下载原图
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingGenerator;
