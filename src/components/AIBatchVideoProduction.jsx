import React, { useState } from 'react';
import {
  Video,
  Loader2,
  Upload,
  Play,
  Download,
  Sparkles,
  FileText,
  Image,
  Settings,
  Check,
  Trash2,
  Film,
  Clock,
  Zap,
  List,
  Plus,
  Minus,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const AIBatchVideoProduction = () => {
  const config = useSystemConfig();
  const [videoTasks, setVideoTasks] = useState([
    { id: 1, title: '', script: '', images: [], template: 'marketing' }
  ]);
  const [globalSettings, setGlobalSettings] = useState({
    aspectRatio: '9:16',
    duration: 30,
    withMusic: true,
    withSubtitles: true,
    outputQuality: '1080p'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [results, setResults] = useState([]);

  const fileInputRefs = React.useRef({});

  const templates = [
    { id: 'marketing', name: '营销推广', desc: '适合产品宣传', icon: '📢' },
    { id: 'story', name: '故事讲述', desc: '适合内容创作', icon: '📖' },
    { id: 'tutorial', name: '教程讲解', desc: '适合知识分享', icon: '📚' },
    { id: 'social', name: '社交媒体', desc: '适合快节奏', icon: '⚡' },
  ];

  const aspectRatios = [
    { id: '9:16', name: '竖屏' },
    { id: '16:9', name: '横屏' },
    { id: '1:1', name: '方形' },
  ];

  const durations = [15, 30, 45, 60, 90];
  const qualities = ['720p', '1080p', '4K'];

  const addTask = () => {
    const newId = Math.max(...videoTasks.map(t => t.id), 0) + 1;
    setVideoTasks([...videoTasks, { id: newId, title: '', script: '', images: [], template: 'marketing' }]);
  };

  const removeTask = (id) => {
    if (videoTasks.length <= 1) {
      alert('至少保留一个任务');
      return;
    }
    setVideoTasks(videoTasks.filter(t => t.id !== id));
  };

  const updateTask = (id, field, value) => {
    setVideoTasks(videoTasks.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleImageUpload = (taskId, e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      alert('只能上传图片文件');
      return;
    }

    validFiles.forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      setVideoTasks(videoTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, images: [...t.images, { file, url: imageUrl }] };
        }
        return t;
      }));
    });
  };

  const handleRemoveImage = (taskId, imageIndex) => {
    setVideoTasks(videoTasks.map(t => {
      if (t.id === taskId) {
        const newImages = [...t.images];
        URL.revokeObjectURL(newImages[imageIndex].url);
        newImages.splice(imageIndex, 1);
        return { ...t, images: newImages };
      }
      return t;
    }));
  };

  const handleBatchGenerate = async () => {
    const validTasks = videoTasks.filter(t => t.script.trim() || t.images.length > 0);

    if (validTasks.length === 0) {
      alert('请至少填写一个任务的剧本或上传图片');
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      trackUserActivity('ai_batch_video_production', 'generate', {
        taskCount: validTasks.length,
        settings: globalSettings
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      for (let i = 0; i < validTasks.length; i++) {
        const task = validTasks[i];
        setProcessingIndex(videoTasks.findIndex(t => t.id === task.id));

        const systemPrompt = `你是一位批量视频制作专家，擅长AI自动化视频生成。

## 你的任务
为每个任务提供详细的视频制作方案。

## 你需要提供
1. **分镜脚本**：详细的镜头描述
2. **画面构成**：每个镜头的视觉元素
3. **节奏控制**：时间分配、转场效果
4. **配乐建议**：音乐风格和情绪
5. **制作提示**：AI工具操作指南

请为每个任务独立输出制作方案。`;

        const userPrompt = `任务 ${i + 1}/${validTasks.length}：
- 标题：${task.title || '未命名'}
- 剧本：${task.script || '无'}
- 图片数：${task.images.length}
- 模板：${templates.find(t => t.id === task.template)?.name}
- 画面比例：${globalSettings.aspectRatio}
- 时长：${globalSettings.duration}秒
- 质量：${globalSettings.outputQuality}

请提供该任务的视频制作方案。`;

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
            max_tokens: 2000
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || '生成失败');
        }

        const solution = data.choices?.[0]?.message?.content || '未获取到方案';

        setResults(prev => [...prev, {
          taskId: task.id,
          title: task.title || `视频 ${prev.length + 1}`,
          solution: solution,
          template: task.template,
          timestamp: new Date().toISOString()
        }]);

        // Small delay between tasks
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProcessingIndex(-1);
    } catch (error) {
      console.error('Batch generation error:', error);
      alert(`批量生成失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    trackUserActivity('ai_batch_video_production', 'download_all', { count: results.length });
    // In real implementation, this would download all videos
    alert('下载功能需要后端支持');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Video size={20} />
          </span>
          AI批量视频制作
        </h2>
        <p className="text-gray-400 max-w-2xl">
          AI批量生成营销视频，支持多任务并行处理，一键输出高质量视频。
        </p>
      </div>

      {/* Global Settings */}
      <div className="bg-ai-card border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-rose-400" />
          <h3 className="text-lg font-semibold text-white">全局设置</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">画面比例</label>
            <select
              value={globalSettings.aspectRatio}
              onChange={(e) => setGlobalSettings({ ...globalSettings, aspectRatio: e.target.value })}
              className="w-full px-3 py-2 bg-ai-dark/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50"
            >
              {aspectRatios.map(ratio => (
                <option key={ratio.id} value={ratio.id}>{ratio.name}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">视频时长</label>
            <select
              value={globalSettings.duration}
              onChange={(e) => setGlobalSettings({ ...globalSettings, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-ai-dark/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50"
            >
              {durations.map(d => (
                <option key={d} value={d}>{d}秒</option>
              ))}
            </select>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">输出质量</label>
            <select
              value={globalSettings.outputQuality}
              onChange={(e) => setGlobalSettings({ ...globalSettings, outputQuality: e.target.value })}
              className="w-full px-3 py-2 bg-ai-dark/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50"
            >
              {qualities.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">附加选项</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGlobalSettings({ ...globalSettings, withMusic: !globalSettings.withMusic })}
                className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${
                  globalSettings.withMusic ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-500'
                }`}
              >
                音乐
              </button>
              <button
                onClick={() => setGlobalSettings({ ...globalSettings, withSubtitles: !globalSettings.withSubtitles })}
                className={`flex-1 px-2 py-2 rounded-lg text-xs transition-all ${
                  globalSettings.withSubtitles ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-500'
                }`}
              >
                字幕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List size={18} className="text-rose-400" />
            <h3 className="text-lg font-semibold text-white">视频任务 ({videoTasks.length})</h3>
          </div>
          <button
            onClick={addTask}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm text-rose-400 transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            添加任务
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {videoTasks.map((task, index) => (
            <div key={task.id} className="bg-ai-card border border-white/5 rounded-xl p-4 space-y-4">
              {/* Task Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                    placeholder="视频标题"
                    className="bg-transparent border-b border-white/10 focus:border-rose-500/50 focus:outline-none text-white text-sm w-40"
                  />
                </div>
                {videoTasks.length > 1 && (
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                )}
              </div>

              {/* Template Selection */}
              <div className="grid grid-cols-4 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => updateTask(task.id, 'template', template.id)}
                    className={`p-2 rounded-lg text-center transition-all ${
                      task.template === template.id
                        ? 'bg-rose-500/20 border border-rose-500/50'
                        : 'bg-white/5 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-lg">{template.icon}</div>
                    <div className="text-xs text-gray-400">{template.name}</div>
                  </button>
                ))}
              </div>

              {/* Script Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">视频剧本</label>
                  <PromptOptimizer
                    value={task.script}
                    onOptimized={(val) => updateTask(task.id, 'script', val)}
                    featureKey="AI批量视频制作"
                    featureContext="批量视频制作任务，优化剧本使其更适合自动化视频生成。"
                    buttonClassName="text-xs px-1.5 py-0.5"
                  />
                </div>
                <textarea
                  value={task.script}
                  onChange={(e) => updateTask(task.id, 'script', e.target.value)}
                  placeholder="描述视频内容、场景、文案..."
                  className="w-full h-20 bg-ai-dark/50 border border-white/10 rounded-lg p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-rose-500/50 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400">图片素材</label>
                <input
                  ref={el => fileInputRefs.current[task.id] = el}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(task.id, e)}
                  className="hidden"
                  id={`images-${task.id}`}
                />
                <label
                  htmlFor={`images-${task.id}`}
                  className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <Upload size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-500">上传图片</span>
                </label>
                {task.images.length > 0 && (
                  <div className="flex gap-2">
                    {task.images.map((img, imgIndex) => (
                      <div key={imgIndex} className="relative w-12 h-12 rounded overflow-hidden group">
                        <img src={img.url} alt={`Upload ${imgIndex}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveImage(task.id, imgIndex)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Status */}
              {isProcessing && processingIndex === index && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  正在制作...
                </div>
              )}
              {results.find(r => r.taskId === task.id) && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check size={14} />
                  已完成
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleBatchGenerate}
        disabled={isProcessing}
        className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
          isProcessing
            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-rose-500/25 hover:scale-[1.01]'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            批量制作中... ({processingIndex + 1}/{videoTasks.length})
          </>
        ) : (
          <>
            <Sparkles size={20} />
            开始批量制作
          </>
        )}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              <h3 className="text-lg font-semibold text-white">制作完成 ({results.length})</h3>
            </div>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm text-rose-400 transition-colors flex items-center gap-2"
            >
              <Download size={14} />
              下载全部
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result) => (
              <div key={result.taskId} className="bg-ai-card border border-white/5 rounded-xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                  <Film size={32} className="text-white/30" />
                </div>
                <div className="p-4">
                  <h4 className="text-white text-sm font-medium mb-2">{result.title}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500">
                      {templates.find(t => t.id === result.template)?.name}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-500">
                      {globalSettings.duration}秒
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-3 mb-3">
                    {result.solution.substring(0, 100)}...
                  </div>
                  <button className="w-full px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-sm text-rose-400 transition-colors flex items-center justify-center gap-1">
                    <Download size={12} />
                    下载视频
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {!isProcessing && results.length === 0 && (
        <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400 space-y-1">
              <div className="text-white font-medium">批量制作说明</div>
              <div>• 支持同时制作多个视频，每个视频可设置不同的剧本、模板和素材</div>
              <div>• 全局设置会应用到所有视频，可在任务卡片中单独调整</div>
              <div>• 建议一次批量制作不超过10个视频，以获得最佳效果</div>
              <div>• 制作完成后可一键下载所有视频</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBatchVideoProduction;
