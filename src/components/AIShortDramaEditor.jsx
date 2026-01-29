import React, { useState } from 'react';
import {
  Wand2,
  Loader2,
  Upload,
  Film,
  Play,
  Download,
  Sparkles,
  FileText,
  Image,
  Music,
  Settings,
  Check,
  Trash2,
  Video,
  Clock,
   SkipForward,
  Volume2,
  Subtitles,
  Scissors,
  AlertCircle
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const AIShortDramaEditor = () => {
  const config = useSystemConfig();
  const [script, setScript] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [videoStyle, setVideoStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState(60);
  const [autoSubtitles, setAutoSubtitles] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = React.useRef(null);

  const videoStyles = [
    { id: 'cinematic', name: '电影感', desc: '专业转场，滤镜效果' },
    { id: 'dynamic', name: '动感快剪', desc: '快速切换，节奏感强' },
    { id: 'minimal', name: '简约清新', desc: '干净利落，突出内容' },
    { id: 'retro', name: '复古怀旧', desc: '胶片质感，温暖色调' },
  ];

  const aspectRatios = [
    { id: '9:16', name: '竖屏', icon: '📱', desc: '适合抖音/快手' },
    { id: '16:9', name: '横屏', icon: '📺', desc: '适合B站/YouTube' },
    { id: '1:1', name: '方形', icon: '⬜', desc: '适合小红书/Instagram' },
  ];

  const presetScripts = [
    {
      name: '霸总虐恋',
      content: '男主霸道总裁，女主普通职员。初遇：他无视她的道歉。冲突：误会重重。高潮：她决定离开。反转：他追到机场。结局：深情拥吻。'
    },
    {
      name: '穿越重生',
      content: '现代女主穿越到古代。初遇：醒来在王府。发展：用现代知识经商。高潮：卷入宫廷斗争。反转：原来是一场梦。结局：回到现代。'
    },
    {
      name: '甜宠宠溺',
      content: '校园青春，男主校草，女主学霸。图书馆偶遇，篮球场搭讪，一起复习考试，操场表白心意，约定考同一所大学。'
    },
    {
      name: '复仇爽剧',
      content: '女主被渣男背叛，重生归来。第一步：识破绿茶。第二步：打脸渣男。第三步：夺回家产。高潮：渣男跪地求饶。结局：女主独自美丽。'
    },
  ];

  const musicOptions = [
    { id: 'none', name: '无音乐', url: null },
    { id: 'romantic', name: '浪漫抒情', url: 'demo' },
    { id: 'tense', name: '紧张激烈', url: 'demo' },
    { id: 'upbeat', name: '欢快活泼', url: 'demo' },
    { id: 'sad', name: '悲伤感人', url: 'demo' },
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      alert('只能上传图片文件');
    }

    if (uploadedImages.length + validFiles.length > 20) {
      alert('最多上传20张图片');
      return;
    }

    validFiles.forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => [...prev, { file, url: imageUrl }]);
    });
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handlePresetScript = (preset) => {
    setScript(preset.content);
  };

  const handleGenerate = async () => {
    if (!script.trim() && uploadedImages.length === 0) {
      alert('请输入剧本或上传图片');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      trackUserActivity('ai_short_drama_editor', 'generate', {
        hasScript: !!script,
        imageCount: uploadedImages.length,
        style: videoStyle,
        aspectRatio,
        duration
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const systemPrompt = `你是一位短视频制作专家，擅长AI零剪辑技术。

## 你的任务
根据用户提供的剧本和素材，提供完整的短剧制作方案。

## 你需要提供
1. **分镜脚本**：详细的镜头描述，包括场景、人物、动作、时长
2. **画面建议**：每个镜头的画面构成、构图、色调
3. **配乐建议**：背景音乐风格、节奏、情绪匹配
4. **字幕设计**：字幕出现时机、样式、特效
5. **转场效果**：镜头间的转场方式
6. **制作技巧**：如何用AI工具实现零剪辑

请以结构化的方式输出制作方案。`;

      const userPrompt = `我想制作一个短剧，需求如下：
${script ? `- 剧本内容：${script}` : '- 无剧本'}
${uploadedImages.length > 0 ? `- 已上传${uploadedImages.length}张图片` : '- 无图片'}
- 视频风格：${videoStyles.find(s => s.id === videoStyle)?.name}
- 画面比例：${aspectRatio}
- 预计时长：${duration}秒
${selectedMusic ? `- 背景音乐：${musicOptions.find(m => m.id === selectedMusic)?.name}` : '- 无背景音乐'}
${autoSubtitles ? '- 需要自动字幕' : '- 不需要字幕'}

请提供详细的短剧制作方案。`;

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
          max_tokens: 4000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '生成失败');
      }

      const solution = data.choices?.[0]?.message?.content || '未获取到方案';

      setResult({
        solution: solution,
        script: script,
        imageCount: uploadedImages.length,
        style: videoStyle,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Generation error:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <Wand2 size={20} />
          </span>
          AI短剧零剪辑
        </h2>
        <p className="text-gray-400 max-w-2xl">
          AI自动剪辑短剧工具，输入剧本上传素材，一键生成完整短视频。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-6">

          {/* Script Input */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText size={16} className="text-violet-400" />
                短剧剧本
              </div>
              <PromptOptimizer
                value={script}
                onOptimized={setScript}
                featureKey="AI短剧零剪辑"
                featureContext="当前使用短剧零剪辑功能，优化剧本使其更适合视频制作，添加场景描述、镜头指示、情感提示等。"
                buttonClassName="text-xs px-2 py-1"
              />
            </div>

            {/* Preset Scripts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {presetScripts.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetScript(preset)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="输入短剧剧本，描述剧情发展、人物对话、场景转换...
例如：
第一幕：女主独自走在雨夜街道，神情落寞
第二幕：男主开车经过，看到她的身影
第三幕：男主下车，递给她一把伞
..."
              className="w-full h-40 bg-ai-card border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all resize-none"
            />
          </section>

          {/* Image Upload */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Image size={16} className="text-pink-400" />
              上传图片素材（可选）
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="drama-images-upload"
            />

            <div className="grid grid-cols-4 gap-3">
              {uploadedImages.map((img, index) => (
                <div key={index} className="relative aspect-square bg-ai-card rounded-lg overflow-hidden group">
                  <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white">
                    {index + 1}
                  </div>
                </div>
              ))}
              {uploadedImages.length < 20 && (
                <label
                  htmlFor="drama-images-upload"
                  className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <Upload size={20} className="text-gray-500" />
                  <span className="text-xs text-gray-500 mt-1">添加图片</span>
                </label>
              )}
            </div>

            <div className="text-xs text-gray-500">
              已上传 {uploadedImages.length}/20 张图片
            </div>
          </section>

          {/* Video Settings */}
          <section className="space-y-4">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Settings size={16} className="text-blue-400" />
              视频设置
            </div>

            {/* Video Style */}
            <div className="grid grid-cols-2 gap-3">
              {videoStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setVideoStyle(style.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    videoStyle === style.id
                      ? 'bg-violet-500/20 border-violet-500/50'
                      : 'bg-ai-card border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-white text-sm">{style.name}</div>
                  <div className="text-xs text-gray-500">{style.desc}</div>
                </button>
              ))}
            </div>

            {/* Aspect Ratio & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">画面比例</label>
                <div className="flex gap-2">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${
                        aspectRatio === ratio.id
                          ? 'bg-violet-500/20 border border-violet-500/50 text-white'
                          : 'bg-white/5 border border-white/5 text-gray-400'
                      }`}
                    >
                      <div className="text-lg mb-1">{ratio.icon}</div>
                      <div>{ratio.name}</div>
                      <div className="text-xs opacity-60">{ratio.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">视频时长</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-white text-sm w-12">{duration}秒</span>
                </div>
              </div>
            </div>

            {/* Music Selection */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">背景音乐</label>
              <div className="flex gap-2">
                {musicOptions.map((music) => (
                  <button
                    key={music.id}
                    onClick={() => setSelectedMusic(music.id)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedMusic === music.id
                        ? 'bg-violet-500/20 border border-violet-500/50 text-white'
                        : 'bg-white/5 border border-white/5 text-gray-400'
                    }`}
                  >
                    <Music size={14} className="inline mr-1" />
                    {music.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Subtitles */}
            <div className="flex items-center justify-between p-3 bg-ai-card rounded-lg">
              <div className="flex items-center gap-2">
                <Subtitles size={16} className="text-violet-400" />
                <span className="text-sm text-white">自动生成字幕</span>
              </div>
              <button
                onClick={() => setAutoSubtitles(!autoSubtitles)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  autoSubtitles ? 'bg-violet-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoSubtitles ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isProcessing || (!script.trim() && uploadedImages.length === 0)}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || (!script.trim() && uploadedImages.length === 0)
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-violet-500/25 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI正在制作中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                开始制作
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">制作方案</span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Video Preview Placeholder */}
                  <div className="aspect-[9/16] bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl relative flex items-center justify-center">
                    <Film size={48} className="text-white/30" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/60 text-xs">
                      <Play size={12} />
                      {duration}秒
                    </div>
                  </div>

                  {/* AI Solution */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">AI制作方案</div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {result.solution}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-gray-500">风格</div>
                      <div className="text-white">{videoStyles.find(s => s.id === result.style)?.name}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-gray-500">时长</div>
                      <div className="text-white">{duration}秒</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <button className="w-full px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 rounded-lg text-sm text-violet-400 transition-colors flex items-center justify-center gap-2">
                      <Download size={14} />
                      导出视频
                    </button>
                    <button className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2">
                      <Copy size={14} />
                      复制方案
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 size={32} className="animate-spin text-violet-400" />
                    ) : (
                      <Scissors size={32} className="opacity-50" />
                    )}
                  </div>
                  <p className="text-sm">
                    {isProcessing ? 'AI正在制作...' : '输入剧本上传素材开始制作'}
                  </p>
                  {isProcessing && (
                    <p className="text-xs text-gray-600">这可能需要几秒钟</p>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            {!result && !isProcessing && (
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>上传图片素材，AI会自动识别内容进行剪辑</div>
                    <div>选择预设剧本可快速开始，也支持自定义剧本</div>
                    <div>支持9:16竖屏、16:9横屏、1:1方形等多种比例</div>
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

export default AIShortDramaEditor;
