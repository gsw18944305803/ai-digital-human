import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Type, 
  Video, 
  Download, 
  RefreshCw, 
  Check, 
  X,
  Wand2,
  Play,
  Share2
} from 'lucide-react';

const SoraVideoGenerator = () => {
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [showOptimizationResult, setShowOptimizationResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [refinePrompt, setRefinePrompt] = useState('');

  // Mock function to simulate prompt optimization
  const handleOptimizePrompt = () => {
    if (!prompt.trim()) return;
    setIsOptimizing(true);
    
    // Simulate API delay
    setTimeout(() => {
      setOptimizedPrompt(`(Cinematic, 8k, High Detail) ${prompt}, photorealistic lighting, shallow depth of field, slow motion, highly detailed texture, unreal engine 5 render style.`);
      setIsOptimizing(false);
      setShowOptimizationResult(true);
    }, 1500);
  };

  const applyOptimized = () => {
    setPrompt(optimizedPrompt);
    setShowOptimizationResult(false);
  };

  const cancelOptimized = () => {
    setShowOptimizationResult(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleGenerate = () => {
    if (!prompt && !uploadedImage) return;
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      setGeneratedVideo("https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4"); // Mock video URL
      setIsGenerating(false);
    }, 3000);
  };

  const handleRegenerate = () => {
    if (!refinePrompt) return;
    setIsGenerating(true);
    // Simulate regeneration
    setTimeout(() => {
      // In a real app, this would be a different video
      setGeneratedVideo("https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4"); 
      setIsGenerating(false);
      setRefinePrompt('');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Video className="text-blue-500" />
          Sora2 视频生成
        </h2>
        <p className="text-sm text-gray-400">
          通过文本或图片，利用 Sora2 模型生成长达 60 秒的高清视频。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mode Toggle */}
          <div className="bg-ai-card border border-white/5 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setMode('text')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'text' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Type size={16} />
              文生视频
            </button>
            <button
              onClick={() => setMode('image')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'image' 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon size={16} />
              图生视频
            </button>
          </div>

          {/* Image Upload Area (Only for Image Mode) */}
          {mode === 'image' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">参考图片</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl bg-ai-dark/30 p-6 transition-colors hover:border-blue-500/50 group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
                  {uploadedImage ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-black/50">
                      <img src={uploadedImage} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <RefreshCw size={16} /> 更换图片
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-200">点击上传图片</p>
                        <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, WEBP (最大 10MB)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                视频描述
                <span className="text-red-500 ml-1">*</span>
              </label>
              <button 
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !prompt}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 hover:border-purple-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Wand2 size={12} />
                )}
                {isOptimizing ? '优化中...' : '智能优化提示词'}
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'text' 
                  ? "描述你想要生成的视频内容，例如：一只赛博朋克风格的猫在霓虹灯闪烁的街道上漫步..." 
                  : "描述如何基于参考图生成视频，例如：让画面中的人物动起来，背景变成下雨天..."
                }
                className="w-full h-32 bg-ai-dark/50 border border-white/10 rounded-xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none transition-all"
              />
              
              {/* Optimization Result Popup */}
              {showOptimizationResult && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-ai-card border border-blue-500/30 rounded-xl shadow-xl z-10 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-xs font-semibold text-purple-300 mb-1">优化建议</h4>
                        <p className="text-sm text-gray-200 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                          {optimizedPrompt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={applyOptimized}
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Check size={14} /> 使用优化结果
                        </button>
                        <button 
                          onClick={cancelOptimized}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <X size={14} /> 保持原样
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt && !uploadedImage)}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                正在生成视频中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                立即生成视频
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview & Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ai-card border border-white/5 rounded-2xl overflow-hidden h-full min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Play size={16} className="text-blue-400" />
                生成预览
              </h3>
              {generatedVideo && (
                <button className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                  历史记录
                </button>
              )}
            </div>

            <div className="flex-1 bg-black/40 relative group">
              {generatedVideo ? (
                <div className="relative h-full flex flex-col">
                  <video 
                    src={generatedVideo} 
                    controls 
                    className="w-full h-full object-contain bg-black"
                    autoPlay
                    loop
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Video size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm">暂无生成内容</p>
                  <p className="text-xs opacity-60 mt-2">在左侧输入描述并点击生成，您的视频将在这里展示</p>
                </div>
              )}
            </div>

            {/* Actions for Generated Video */}
            {generatedVideo && (
              <div className="p-5 space-y-4 border-t border-white/5 bg-ai-dark/30">
                <div className="flex gap-3">
                  <button className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                    <Download size={16} />
                    下载视频
                  </button>
                  <button className="h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors" title="分享">
                    <Share2 size={18} />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-xs font-medium text-gray-400">不满意？修改细节重新生成</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      placeholder="例如：把背景调暗一些，增加下雨的效果..."
                      className="flex-1 bg-ai-dark border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                    <button 
                      onClick={handleRegenerate}
                      disabled={isGenerating || !refinePrompt}
                      className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoraVideoGenerator;
