import React, { useState, useEffect, useRef } from 'react';
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
  Play,
  Share2,
  Loader2,
  Search,
  History,
  Trash2,
  Eye
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';

const SoraVideoGenerator = () => {
  const config = useSystemConfig();
  const soraConfig = config.models.sora || config.models.video; // Fallback for old config structure

  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null); // This is the preview URL
  const [selectedFile, setSelectedFile] = useState(null); // This is the actual File object
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [error, setError] = useState('');
  const [progressMsg, setProgressMsg] = useState('');

  // 新增状态
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [searchVideoId, setSearchVideoId] = useState('');
  const [currentVideoTimestamp, setCurrentVideoTimestamp] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sentPrompt, setSentPrompt] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);

  // Parameter States
  const [selectedModel, setSelectedModel] = useState(soraConfig?.modelName || 'sora-2');
  const [duration, setDuration] = useState(4);
  const [aspectRatio, setAspectRatio] = useState('1280x720');

  const apiKey = soraConfig?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
  // 使用代理路径避免CORS问题
  const submitUrl = '/api/302/openai/v1/videos';
  const isMounted = useRef(true);

  // Helper to get content URL - 使用代理路径避免CORS问题
  const getContentUrl = (id) => {
    // 通过Vite代理: /api/302 -> https://api.302.ai
    return `/api/302/openai/v1/videos/${id}/content`;
  };

  // Helper to get status URL - 使用代理路径避免CORS问题
  const getStatusUrl = (id) => {
    // 通过Vite代理: /api/302 -> https://api.302.ai
    return `/api/302/openai/v1/videos/${id}`;
  };

  // Helper to get delete URL
  const getDeleteUrl = (id) => {
    if (soraConfig?.deleteUrl) {
      return soraConfig.deleteUrl.replace('{id}', id);
    }
    return `/api/302/v1/video/generations/${id}`;
  };

  useEffect(() => {
    if (soraConfig?.modelName) {
      setSelectedModel(soraConfig.modelName);
    }
  }, [soraConfig]);


  useEffect(() => {
    // 从 localStorage 加载历史记录
    const savedHistory = localStorage.getItem('soraVideoHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // 保存历史记录到 localStorage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('soraVideoHistory', JSON.stringify(newHistory));
  };

  // 添加到历史记录
  const addToHistory = (videoId, videoUrl, prompt, mode) => {
    const newRecord = {
      id: videoId,
      url: videoUrl,
      prompt: prompt,
      mode: mode,
      timestamp: new Date().toISOString(),
    };
    const newHistory = [newRecord, ...history].slice(0, 20); // 最多保留20条
    saveHistory(newHistory);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadedImage(URL.createObjectURL(file));
      setError('');
    }
  };

  // 第一阶段：轮询视频生成状态（每隔5秒）
  const pollVideoStatus = async (videoId) => {
    const maxRetries = 120; // 最多轮询 10 分钟 (120 * 5秒 = 600秒)
    let retries = 0;

    try {
      while (retries < maxRetries) {
        // 进度从10%逐渐增加到85%
        const currentProgress = Math.min(10 + (retries / maxRetries) * 75, 85);
        setProgressMsg(`正在生成视频... ${currentProgress.toFixed(0)}%`);
        setGenerationProgress(currentProgress);

        const response = await fetch(getStatusUrl(videoId), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Poll response status:', response.status);

        if (!response.ok) {
          console.warn(`Poll status check failed: ${response.status}`);
          setProgressMsg(`查询失败: HTTP ${response.status}, 正在重试...`);
        } else {
          const data = await response.json();
          console.log('Poll response:', data);

          // 状态映射
          const status = (data.status || data.data?.status || '').toLowerCase();
          setProgressMsg(`正在生成视频... ${currentProgress.toFixed(0)}% (状态: ${status || '处理中'})`);

          // 检查是否完成
          if (status === 'completed' || status === 'succeeded' || status === 'success' || status === 'done') {
            setProgressMsg('生成完成！正在获取视频地址...');
            setGenerationProgress(90);
            // 进入第二阶段：获取视频内容
            await fetchVideoContent(videoId);
            return;
          } else if (status === 'failed' || status === 'error') {
            const errorMsg = data.error?.message || data.message || data.data?.error || '未知错误';
            throw new Error(`视频生成失败: ${errorMsg}`);
          }
          // 如果是 processing, pending, submitted 等状态，继续轮询
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // 每5秒查询一次
        retries++;
      }

      if (retries >= maxRetries) {
        setError(`生成超时(已等待${maxRetries * 5}秒)。视频ID: ${videoId}，请稍后使用此ID手动检索`);
        setIsGenerating(false);
        setGenerationProgress(0);
      }
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message || '获取结果失败');
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 第二阶段：生成完成后，获取视频内容（使用官方格式）
  const fetchVideoContent = async (videoId) => {
    try {
      console.log('========================================');
      console.log('开始获取视频内容，视频ID:', videoId);
      console.log('========================================');

      setProgressMsg('正在获取���频地址...');
      setGenerationProgress(92);

      // 使用官方格式接口��GET /openai/v1/videos/{video_id}/content
      const contentUrl = getContentUrl(videoId);
      console.log('内容接口URL（代理路径）:', contentUrl);
      console.log('最终请求地址将被代理到:', `https://api.302.ai/openai/v1/videos/${videoId}/content`);

      const response = await fetch(contentUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      console.log('内容响应状态:', response.status, response.statusText);
      console.log('内容响应头:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('内容API错误:', errorText);
        throw new Error(`获取视频失败: HTTP ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('内容响应数据:', JSON.stringify(data, null, 2));

      // 提取视频URL - 根据官方文档，返回格式�� { "url": "视频地址" }
      let videoUrl = null;
      if (data.url && typeof data.url === 'string' && data.url.length > 0) {
        videoUrl = data.url;
        console.log('找到视频URL（标准字段）:', videoUrl);
      } else if (data.video_url) {
        videoUrl = data.video_url;
        console.log('找到视频URL（备用字段1）:', videoUrl);
      } else if (data.data?.url) {
        videoUrl = data.data.url;
        console.log('找到视频URL（嵌套字段）:', videoUrl);
      }

      console.log('最终提取的视频URL:', videoUrl);

      if (videoUrl) {
        console.log('准备设置视频URL到状态');
        console.log('isMounted.current:', isMounted.current);
        // 直接设置状态，不检查 isMounted
        setGeneratedVideo(videoUrl);
        setIsGenerating(false);
        setProgressMsg('✓ ���索成功！视频已加载');
          setGenerationProgress(100);
          console.log('========================================');
          console.log('视频检索成功！');
          console.log('generatedVideo 状态已设置为:', videoUrl);
          console.log('isGenerating 状态已设置为: false');
          console.log('========================================');

          // 添加到历史记录
          addToHistory(videoId, videoUrl, sentPrompt, mode);

          // 设置当前视频的时间戳
          setCurrentVideoTimestamp(new Date().toLocaleString('zh-CN'));
      } else {
        console.error('未找到视频URL！响应数据:', data);
        throw new Error('视频生成成功但未找到视频地址');
      }
    } catch (err) {
      console.error('========================================');
      console.error('获取视频内容失败:', err);
      console.error('========================================');
      // 直接设置错误状态，不检查 isMounted
      setError(`获取视频失败: ${err.message}`);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 文生视频
  const handleTextToVideo = async () => {
    if (!prompt.trim()) {
      setError('请输入视频描述');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setError('');
    setProgressMsg('正在提交任务到 Sora...');
    setGenerationProgress(5);
    setSentPrompt(prompt);

    try {
      // 使用 302.ai OpenAI Video API 格式
      const requestBody = {
        model: selectedModel,
        prompt: prompt.trim(),
        seconds: duration,
        size: aspectRatio
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Submission response:', data);
      console.log('Response structure:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `任务提交失败: ${response.status} - ${JSON.stringify(data)}`);
      }

      // 更灵活的ID提取
      const videoId = data.id || data.video_id || data.data?.id || data.data?.video_id || data.task_id;

      if (!videoId) {
        console.error('ID Extraction failed. Response data:', data);
        throw new Error(`未获取到视频ID。API返回: ${JSON.stringify(data)}`);
      }

      console.log('Video ID:', videoId);
      setCurrentVideoId(videoId);
      setProgressMsg(`任务提交成功！视频ID: ${videoId}，开始轮询生成状态...`);
      setGenerationProgress(10);

      await pollVideoStatus(videoId);

    } catch (err) {
      console.error('Generation Error:', err);
      setError(err.message);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 图生视频
  const handleImageToVideo = async () => {
    if (!selectedFile) {
      setError('请先上传图片');
      return;
    }

    if (!prompt.trim()) {
      setError('请输入视频描述');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setError('');
    setProgressMsg('正在上传图片并提交任务...');
    setGenerationProgress(10);
    setSentPrompt(prompt);

    try {
      // 将图片转换为 base64
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          // 保留完整的 data URL
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const requestBody = {
        model: selectedModel,
        prompt: prompt.trim(),
        seconds: duration,
        size: aspectRatio,
        image: imageBase64
      };

      console.log('Request body:', JSON.stringify({...requestBody, image: '...base64...'}, null, 2));

      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Submission response:', data);
      console.log('Response structure:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `任务提交失败: ${response.status} - ${JSON.stringify(data)}`);
      }

      // 更灵活的ID提取
      const videoId = data.id || data.video_id || data.data?.id || data.data?.video_id || data.task_id;

      if (!videoId) {
        console.error('ID Extraction failed. Response data:', data);
        throw new Error(`未获取到视频ID。API返回: ${JSON.stringify(data)}`);
      }

      console.log('Video ID:', videoId);
      setCurrentVideoId(videoId);
      setProgressMsg(`任务提交成功！视频ID: ${videoId}，开始轮询生成状态...`);
      setGenerationProgress(10);

      await pollVideoStatus(videoId);

    } catch (err) {
      console.error('Generation Error:', err);
      setError(err.message);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 处理生成按钮
  const handleGenerate = () => {
    if (mode === 'text') {
      handleTextToVideo();
    } else {
      handleImageToVideo();
    }
  };

  // 通过视频ID检索视频
  const handleSearchById = async () => {
    if (!searchVideoId.trim()) {
      setError('请输入视频ID');
      return;
    }

    setIsGenerating(true);
    setError('');
    setProgressMsg('正在检索视频...');
    setGenerationProgress(5);

    try {
      // 强力清洗ID：去除所有空白字符
      const videoId = searchVideoId.trim().replace(/[\s\u00A0\u3000]+/g, '_');

      console.log('========================================');
      console.log('开始检索视频 ID:', videoId);
      console.log('========================================');

      // 第一阶段：检查状态
      setGenerationProgress(10);
      setProgressMsg('正在检查生成状态...');

      const statusUrl = getStatusUrl(videoId);
      console.log('状态接口 URL（代理路径）:', statusUrl);
      console.log('最终请求地址将被代理到:', `https://api.302.ai/openai/v1/videos/${videoId}`);

      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('状态响应状态:', statusResponse.status);
      console.log('状态响应头:', [...statusResponse.headers.entries()]);

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('状态API错误:', errorText);
        throw new Error(`检查状态失败: HTTP ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      console.log('状态响应数据:', JSON.stringify(statusData, null, 2));

      const status = (statusData.status || statusData.data?.status || '').toLowerCase();
      console.log('视频状态:', status);

      // 如果视频还在生成中，开始轮询状态
      if (status === 'processing' || status === 'pending' || status === 'submitted' || status === 'in_progress') {
        setProgressMsg(`视频正在生成中... 开始轮询状态`);
        setCurrentVideoId(videoId);
        await pollVideoStatus(videoId);
        return;
      }

      // 如果已经完成，继续获取视频URL
      console.log('视频已完成，准备获取视频地址');
      setGenerationProgress(20);
      setProgressMsg('视频已完成，正在获取视频地址...');

      // 第二阶段：使用官方格式接口获取视频��容
      setGenerationProgress(90);
      await fetchVideoContent(videoId);
      setCurrentVideoId(videoId);

    } catch (err) {
      console.error('========================================');
      console.error('检索失败:', err);
      console.error('========================================');
      // 直接设置错误状态，不检查 isMounted
      setError(`检索失败: ${err.message}`);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 删除视频
  const handleDeleteVideo = async (videoId) => {
    if (!confirm(`确定要删除视频 ${videoId} 吗？`)) {
      return;
    }

    try {
      const response = await fetch(getDeleteUrl(videoId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('删除成功');
        // 从历史记录中移除
        const newHistory = history.filter(item => item.id !== videoId);
        saveHistory(newHistory);

        // 如果删除的是当前显示的视频，清空预览
        if (currentVideoId === videoId) {
          setGeneratedVideo(null);
          setCurrentVideoId('');
        }
      } else {
        const data = await response.json();
        throw new Error(data.error?.message || '删除失败');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      alert(err.message);
    }
  };

  // 从历史记录中加载视频
  const loadFromHistory = (record) => {
    setGeneratedVideo(record.url);
    setCurrentVideoId(record.id);
    setSentPrompt(record.prompt);
    if (record.timestamp) {
      setCurrentVideoTimestamp(new Date(record.timestamp).toLocaleString('zh-CN'));
    }
    setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <Video className="text-blue-500" />
          Sora2 视频生成
        </h2>
        <p className="text-sm text-gray-400">
          通过文本或图片，利用 Sora2 模型生成高质量视频。
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

          {/* Parameter Settings */}
          <div className="bg-ai-card border border-white/5 rounded-xl p-6 space-y-6">


            {/* Duration Selection */}
            <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-gray-300 w-16">时长</label>
               <div className="flex items-center gap-6">
                 {[4, 8, 12].map((s) => (
                   <label key={s} className="flex items-center gap-2 cursor-pointer group">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${duration === s ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                        {duration === s && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                     </div>
                     <span className={`text-sm ${duration === s ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>{s}秒</span>
                     <input
                       type="radio"
                       name="duration"
                       value={s}
                       checked={duration === s}
                       onChange={() => setDuration(s)}
                       className="hidden"
                     />
                   </label>
                 ))}
               </div>
            </div>

            {/* Size Selection */}
            <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-gray-300 w-16">分辨率</label>
               <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                 {['1280x720', '720x1280', '1024x1792', '1792x1024'].map((s) => (
                   <label key={s} className="flex items-center gap-2 cursor-pointer group">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${aspectRatio === s ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                        {aspectRatio === s && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                     </div>
                     <span className={`text-sm ${aspectRatio === s ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>{s}</span>
                     <input
                       type="radio"
                       name="size"
                       value={s}
                       checked={aspectRatio === s}
                       onChange={() => setAspectRatio(s)}
                       className="hidden"
                     />
                   </label>
                 ))}
               </div>
            </div>
          </div>

          {/* Search by Video ID */}
          <div className="bg-ai-card border border-white/5 rounded-xl p-4 space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Search size={14} />
              通过视频ID检索
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchVideoId}
                onChange={(e) => setSearchVideoId(e.target.value)}
                placeholder="输入之前生成的视频ID..."
                className="flex-1 bg-ai-dark/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <button
                onClick={handleSearchById}
                disabled={!searchVideoId.trim() || isGenerating}
                className="px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Eye size={14} />
                检索
              </button>
            </div>
          </div>

          {/* Image Upload Area (Only for Image Mode) */}
          {mode === 'image' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">参考图片</label>
              <div className={`border-2 border-dashed rounded-xl bg-ai-dark/30 p-6 transition-colors group ${error && !selectedFile ? 'border-red-500/50' : 'border-white/10 hover:border-blue-500/50'}`}>
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
              <PromptOptimizer
                value={prompt}
                onOptimized={setPrompt}
                featureKey="Sora2 视频生成"
                featureContext={`当前使用Sora视频生成功能，${mode === 'text' ? '文生视频' : '图生视频'}模式。优化时使描述更加详细、具体，添加场景、镜头、光影、动作等细节描述，使视频生成效果更佳。`}
                buttonClassName="text-xs px-2 py-1"
              />
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'text'
                  ? "描述你想要生成的视频内容，例如：一只赛博朋克风格的猫在霓虹灯闪烁的街道上漫步..."
                  : "描述图片的动态效果，例如：让水流流动起来..."
                }
                className="w-full h-32 bg-ai-dark/50 border border-white/10 rounded-xl p-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none transition-all"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim()) || (mode === 'image' && !selectedFile)}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {progressMsg || '正在生成视频中...'}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                立即生成视频
              </>
            )}
          </button>

          {/* 显示生成进度条 */}
          {isGenerating && generationProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>生成进度</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full h-2 bg-ai-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 显示发送的提示词 */}
          {sentPrompt && isGenerating && (
            <div className="bg-ai-card border border-blue-500/30 rounded-xl p-4 space-y-2">
              <div className="text-xs font-medium text-blue-300 flex items-center gap-2">
                <Check size={12} />
                已发送至 Sora2 的提示词
              </div>
              <p className="text-sm text-gray-300 bg-black/30 p-3 rounded-lg">
                {sentPrompt}
              </p>
            </div>
          )}

          {/* 当前视频ID显示 */}
          {currentVideoId && (
            <div className="bg-ai-card border border-green-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-green-300">当前视频ID</div>
                {currentVideoTimestamp && (
                   <div className="text-xs text-gray-500">{currentVideoTimestamp}</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm text-gray-300 bg-black/30 p-2 rounded-lg flex-1 break-all">
                  {currentVideoId}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentVideoId);
                    alert('已复制到剪贴板');
                  }}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs transition-colors"
                >
                  复制
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <X size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Preview & Results */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-ai-card border border-white/5 rounded-2xl overflow-hidden h-full min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-medium text-gray-200 flex items-center gap-2">
                <Play size={16} className="text-blue-400" />
                视频预览
              </h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <History size={12} />
                历史记录 ({history.length})
              </button>
            </div>

            {/* 历史记录弹窗 */}
            {showHistory && (
              <div className="absolute top-16 right-4 w-96 max-h-96 bg-ai-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h4 className="text-sm font-medium text-gray-200">历史记录</h4>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      暂无历史记录
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {history.map((record, index) => (
                        <div
                          key={index}
                          className="p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex-1"
                              onClick={() => loadFromHistory(record)}
                            >
                              <div className="text-xs text-gray-400 mb-1">
                                {new Date(record.timestamp).toLocaleString('zh-CN')}
                              </div>
                              <div className="text-sm text-gray-300 mb-1 line-clamp-2">
                                {record.prompt}
                              </div>
                              <div className="text-xs text-blue-400 font-mono">
                                ID: {record.id.slice(0, 20)}...
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVideo(record.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 bg-black/40 relative group">
              {generatedVideo ? (
                <div className="relative h-full flex flex-col">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full h-full object-contain bg-black"
                    autoPlay
                    loop
                    playsInline
                  />
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-300">{progressMsg}</p>
                  <p className="text-xs opacity-60 mt-2">预计需要 1-3 分钟，请耐心等待</p>
                  {currentVideoId && (
                    <div className="mt-3 text-xs text-blue-400">
                      视频ID: {currentVideoId}
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Video size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm">暂无生成内容</p>
                  <p className="text-xs opacity-60 mt-2">在左侧输入描述并点击生成，或输入视频ID检索</p>
                </div>
              )}
            </div>

            {/* Actions for Generated Video */}
            {generatedVideo && (
              <div className="p-5 space-y-4 border-t border-white/5 bg-ai-dark/30">
                <div className="flex gap-3">
                  <a
                    href={generatedVideo}
                    download="sora-video.mp4"
                    className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors no-underline"
                  >
                    <Download size={16} />
                    下载视频
                  </a>
                  <button className="h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors" title="分享">
                    <Share2 size={18} />
                  </button>
                </div>

                {sentPrompt && (
                  <div className="pt-2 border-t border-white/5">
                    <label className="text-xs font-medium text-gray-400 mb-2 block">生成提示词</label>
                    <p className="text-xs text-gray-300 bg-black/30 p-2 rounded-lg line-clamp-3">
                      {sentPrompt}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoraVideoGenerator;
