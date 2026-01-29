import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { Languages, Loader2, Upload, Download, Video, FileAudio, Subtitles, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const VideoTranslator = ({ featureKey = 'AI视频深度翻译' }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  const [videoUrl, setVideoUrl] = useState('');
  const [targetLang, setTargetLang] = useState('zh');
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, completed, error
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' }
  ];

  const steps = [
    { name: '视频下载', icon: Video, status: 'pending' },
    { name: '音频提取', icon: FileAudio, status: 'pending' },
    { name: '语音转文字', icon: Languages, status: 'pending' },
    { name: '字幕翻译', icon: Subtitles, status: 'pending' },
    { name: '视频烧录', icon: CheckCircle, status: 'pending' }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleTranslate = async () => {
    if (!videoUrl.trim()) {
      alert('请输入视频URL');
      return;
    }

    setStatus('processing');
    setResult(null);
    setProgress(0);

    try {
      // 步骤1: 下载视频
      setCurrentStep(0);
      setProgress(10);
      const downloadRes = await fetch('/api/302/302/video/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: videoUrl.trim() })
      });

      if (!downloadRes.ok) throw new Error('视频下载失败');
      const downloadData = await downloadRes.json();
      console.log('🎥 视频下载:', downloadData);

      // 步骤2: 分离音轨
      setCurrentStep(1);
      setProgress(30);
      const audioRes = await fetch('/api/302/302/video/separate_audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ video_id: downloadData.video_id })
      });

      if (!audioRes.ok) throw new Error('音频提取失败');
      const audioData = await audioRes.json();
      console.log('🎵 音频提取:', audioData);

      // 步骤3: 语音转文字
      setCurrentStep(2);
      setProgress(50);
      const transcribeRes = await fetch('/api/302/302/video/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_id: audioData.audio_id,
          language: 'auto'
        })
      });

      if (!transcribeRes.ok) throw new Error('语音转文字失败');
      const transcribeData = await transcribeRes.json();
      console.log('📝 语音转文字:', transcribeData);

      // 步骤4: 字幕翻译
      setCurrentStep(3);
      setProgress(70);
      const translateRes = await fetch('/api/302/302/video/translate_subtitle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subtitle_id: transcribeData.subtitle_id,
          target_language: targetLang
        })
      });

      if (!translateRes.ok) throw new Error('字幕翻译失败');
      const translateData = await translateRes.json();
      console.log('🌐 字幕翻译:', translateData);

      // 步骤5: 视频烧录
      setCurrentStep(4);
      setProgress(90);
      const burnRes = await fetch('/api/302/302/video/burn_subtitle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_id: downloadData.video_id,
          subtitle_id: translateData.subtitle_id
        })
      });

      if (!burnRes.ok) throw new Error('视频烧录失败');
      const burnData = await burnRes.json();
      console.log('🎬 视频烧录:', burnData);

      setResult({
        videoUrl: burnData.video_url,
        subtitleUrl: translateData.subtitle_url
      });
      setStatus('completed');
      setProgress(100);
    } catch (err) {
      console.error('翻译错误:', err);
      setStatus('error');
      alert(`翻译失败: ${err.message}`);
    }
  };

  const handleDownload = () => {
    if (result?.videoUrl) {
      window.open(result.videoUrl, '_blank');
    }
  };

  if (!featureConfig?.apiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>请联系管理员配置 API Key</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl shadow-lg">
          <Languages size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 视频深度翻译</h1>
          <p className="text-sm text-gray-500">智能视频翻译，支持多语言字幕与配音</p>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-5">
          {/* 视频URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video size={16} className="inline mr-1" />
              视频URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="输入需要翻译的视频URL（支持YouTube、Bilibili等平台）"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 bg-white"
              disabled={status === 'processing'}
            />
          </div>

          {/* 目标语言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目标语言</label>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 bg-white"
              disabled={status === 'processing'}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* 开始翻译按钮 */}
          <button
            onClick={handleTranslate}
            disabled={status === 'processing' || !videoUrl.trim()}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <Languages size={20} />
                开始翻译
              </>
            )}
          </button>
        </div>
      </div>

      {/* 处理进度 */}
      {status === 'processing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">处理进度</h3>

          {/* 步骤列表 */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepStatus = index < currentStep ? 'completed' : index === currentStep ? 'processing' : 'pending';
              return (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                  stepStatus === 'completed' ? 'bg-green-50' :
                  stepStatus === 'processing' ? 'bg-violet-50' :
                  'bg-gray-50'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    stepStatus === 'completed' ? 'bg-green-500 text-white' :
                    stepStatus === 'processing' ? 'bg-violet-500 text-white' :
                    'bg-gray-300 text-gray-500'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`flex-1 font-medium ${
                    stepStatus === 'completed' ? 'text-green-700' :
                    stepStatus === 'processing' ? 'text-violet-700' :
                    'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                  {stepStatus === 'completed' && <CheckCircle size={18} className="text-green-500" />}
                  {stepStatus === 'processing' && <Loader2 size={18} className="text-violet-500 animate-spin" />}
                </div>
              );
            })}
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">正在处理，请稍候... ({progress}%)</p>
        </div>
      )}

      {/* 完成结果 */}
      {status === 'completed' && result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">翻译完成！</h2>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 flex items-center gap-2 transition-colors font-medium"
            >
              <Download size={18} />
              下载视频
            </button>
          </div>

          {/* 视频预览 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>视频链接：</strong>
              <a href={result.videoUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline ml-2">
                {result.videoUrl}
              </a>
            </p>
            {result.subtitleUrl && (
              <p className="text-sm text-gray-600">
                <strong>字幕链接：</strong>
                <a href={result.subtitleUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline ml-2">
                  {result.subtitleUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-2" size={48} />
          <p className="text-red-600 font-medium">处理失败，请检查视频URL是否正确</p>
          <button
            onClick={() => {
              setStatus('idle');
              setCurrentStep(0);
              setProgress(0);
            }}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重新尝试
          </button>
        </div>
      )}

      {/* 初始提示 */}
      {status === 'idle' && (
        <div className="text-center text-gray-400 mt-20">
          <Video size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">输入视频URL开始翻译</p>
          <p className="text-sm mt-2">支持自动识别语音、翻译字幕、烧录视频</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-violet-50 rounded-xl p-6">
        <h3 className="font-bold text-violet-800 mb-3 flex items-center gap-2">
          <Clock size={18} />
          处理流程
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-violet-700">
          <div className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span><strong>视频下载</strong>：从源URL下载视频文件</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span><strong>音频提取</strong>：从视频中分离音频轨道</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span><strong>语音转文字</strong>：AI自动识别语音并生成字幕</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span><strong>字幕翻译</strong>：将字幕翻译成目标语言</span>
          </div>
          <div className="flex items-start gap-2 md:col-span-2">
            <span className="font-bold">5.</span>
            <span><strong>视频烧录</strong>：将翻译后的字幕烧录到视频中</span>
          </div>
        </div>
        <p className="text-xs text-violet-600 mt-4">
          注意：视频处理需要一定时间，具体时长取决于视频大小和服务器负载。
        </p>
      </div>
    </div>
  );
};

export default VideoTranslator;
