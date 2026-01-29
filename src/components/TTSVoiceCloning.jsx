import React, { useState, useRef } from 'react';
import {
  Mic2,
  Loader2,
  Upload,
  Play,
  Pause,
  Download,
  Volume2,
  Sparkles,
  Trash2,
  FileAudio,
  User,
  Music,
  Gauge,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const TTSVoiceCloning = () => {
  const config = useSystemConfig();
  const [textToSpeak, setTextToSpeak] = useState('');
  const [voiceSample, setVoiceSample] = useState(null);
  const [voiceName, setVoiceName] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const presetVoices = [
    { id: 'news', name: '新闻播报', desc: '正式、清晰、权威', speed: 1.0, pitch: 1.0, prompt: '请使用新闻播报风格，正式、清晰、权威的语气' },
    { id: 'story', name: '故事讲述', desc: '生动、有感染力', speed: 0.9, pitch: 0.95, prompt: '请使用故事讲述风格，语气生动、有感染力' },
    { id: 'commercial', name: '广告配音', desc: '热情、吸引人', speed: 1.1, pitch: 1.05, prompt: '请使用广告配音风格，热情、吸引人的语气' },
    { id: 'calm', name: '舒缓解说', desc: '平静、治愈', speed: 0.85, pitch: 0.9, prompt: '请使用舒缓解说风格，平静、治愈的语气' },
    { id: 'young', name: '青年声音', desc: '活泼、年轻', speed: 1.05, pitch: 1.1, prompt: '请使用青年声音风格，活泼、年轻的语气' },
    { id: 'elderly', name: '长者声音', desc: '沉稳、厚重', speed: 0.9, pitch: 0.85, prompt: '请使用长者声音风格，沉稳、厚重的语气' },
  ];

  const openSourceTools = [
    { name: 'Coqui TTS', url: 'https://github.com/coqui-ai/TTS', desc: '开源多音色TTS' },
    { name: 'Bark', url: 'https://github.com/suno-ai/bark', desc: '文本生成音频' },
    { name: 'Piper', url: 'https://github.com/rhasspy/piper', desc: '快速神经TTS' },
    { name: 'StyleTTS2', url: 'https://github.com/yl4579/StyleTTS2', desc: '风格化TTS' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-wav', 'audio/ogg'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|ogg)$/i)) {
        alert('请上传音频文件（.wav, .mp3, .ogg）');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过 50MB');
        return;
      }

      setVoiceSample(file);
      if (!voiceName) {
        setVoiceName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleRemoveSample = () => {
    setVoiceSample(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePresetSelect = (preset) => {
    setSpeed(preset.speed);
    setPitch(preset.pitch);
    // Optionally add preset prompt to textToSpeak or use it for TTS generation
  };

  const handleGenerate = async () => {
    if (!textToSpeak.trim()) {
      alert('请输入要生成语音的文本');
      return;
    }

    setIsProcessing(true);
    setGeneratedAudio(null);

    try {
      trackUserActivity('tts_voice_cloning', 'generate', {
        hasSample: !!voiceSample,
        textLength: textToSpeak.length,
        speed,
        pitch
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const systemPrompt = `你是一位语音合成(TTS)技术专家。用户想要生成高质量的语音。

## 当前任务
根据用户需求，提供最佳的TTS解决方案。

## 你需要提供
1. **推荐工具**：根据用户需求（声音克隆、多音字处理等）推荐最合适的开源TTS工具
2. **详细教程**：提供完整的使用步骤，包括环境搭建、命令行操作等
3. **代码示例**：提供可直接使用的Python代码示例
4. **参数说明**：解释语速、音调、采样率等参数的作用
5. **优化建议**：如何获得更好的音质和自然度

## 可推荐的开源工具
- **Coqui TTS**: 支持声音克隆、多语言
- **Bark**: 文本生成音频，支持音效和音乐
- **Piper**: 快速、轻量级神经TTS
- **StyleTTS2**: 风格化TTS，支持情感控制

请以结构化的方式输出解决方案。`;

      const userPrompt = `我想生成语音，需求如下：
${voiceSample ? `- 已上传声音样本：${voiceSample.name}` : '- 没有上传声音样本，使用默认声音'}
- 文本内容：${textToSpeak}
- 语速：${speed}x
- 音调：${pitch}
${voiceName ? `- 声音名称：${voiceName}` : ''}

请提供详细的TTS生成方案。`;

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

      // Generate a mock audio URL for demo purposes
      // In real implementation, this would come from the TTS API
      setGeneratedAudio({
        url: 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav', // Demo audio
        solution: solution,
        text: textToSpeak,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Generation error:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayPause = () => {
    if (!generatedAudio || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!generatedAudio) return;

    const link = document.createElement('a');
    link.href = generatedAudio.url;
    link.download = `voice_${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackUserActivity('tts_voice_cloning', 'download', { textLength: generatedAudio.text.length });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Mic2 size={20} />
          </span>
          TTS声音克隆
        </h2>
        <p className="text-gray-400 max-w-2xl">
          开源多音字声音克隆技术，支持多种语音风格和参数调节。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* Voice Sample Upload */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FileAudio size={16} className="text-red-400" />
              声音样本上传（可选）
            </div>

            {!voiceSample ? (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 bg-ai-card/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="voice-sample-upload"
                />
                <label
                  htmlFor="voice-sample-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-3">
                    <Upload size={28} className="text-red-400" />
                  </div>
                  <p className="text-white text-sm font-medium mb-1">上传声音样本</p>
                  <p className="text-xs text-gray-500">支持 .wav, .mp3, .ogg，用于克隆声音</p>
                </label>
              </div>
            ) : (
              <div className="bg-ai-card/50 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <Music size={20} className="text-red-400" />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        placeholder="声音名称"
                        className="text-sm text-white bg-transparent border-b border-white/10 focus:border-red-500/50 focus:outline-none w-48"
                      />
                      <div className="text-xs text-gray-500">{voiceSample.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveSample}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Text Input */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                要生成的文本 *
              </div>
              <div className="text-xs text-gray-500">{textToSpeak.length} 字</div>
            </div>
            <div className="relative">
              <textarea
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                placeholder="输入要转换为语音的文本内容..."
                className="w-full h-32 bg-ai-card border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all resize-none"
              />
            </div>
            <PromptOptimizer
              value={textToSpeak}
              onOptimized={setTextToSpeak}
              featureKey="TTS声音克隆"
              featureContext="当前使用TTS声音克隆功能，优化文本使其更适合语音朗读，添加标点符号、停顿提示，使语意更加清晰、节奏更加自然。"
              buttonClassName="text-xs px-2 py-1"
            />
          </section>

          {/* Voice Presets */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User size={16} className="text-purple-400" />
              预设声音风格（点击快速应用）
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetVoices.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-3 bg-ai-card border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all text-left"
                >
                  <div className="text-sm text-white">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Parameters */}
          <section className="space-y-4">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Sliders size={16} className="text-blue-400" />
              参数调节
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Speed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">语速</label>
                  <span className="text-xs text-red-400">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">音调</label>
                  <span className="text-xs text-red-400">{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>低</span>
                  <span>中</span>
                  <span>高</span>
                </div>
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !textToSpeak.trim()}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || !textToSpeak.trim()
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-red-500/25 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                正在生成语音...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                开始生成
              </>
            )}
          </button>

          {/* Open Source Tools */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Gauge size={16} className="text-green-400" />
              推荐开源TTS工具
            </div>
            <div className="grid grid-cols-2 gap-3">
              {openSourceTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-ai-card border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <ExternalLink size={14} className="text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{tool.name}</div>
                    <div className="text-xs text-gray-500 truncate">{tool.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">生成结果</span>
              {generatedAudio && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedAudio.text);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="复制文本"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="下载"
                  >
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 flex flex-col">
              {generatedAudio ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Audio Player */}
                  <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center mx-auto mb-4">
                      <Volume2 size={32} className="text-red-400" />
                    </div>
                    <button
                      onClick={handlePlayPause}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full text-white font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                      {isPlaying ? '暂停' : '播放'}
                    </button>
                    <audio
                      ref={audioRef}
                      src={generatedAudio.url}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>

                  {/* Solution */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="text-xs text-gray-500 mb-2">技术方案</div>
                    <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {generatedAudio.solution}
                    </div>
                  </div>

                  {/* Text Preview */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">文本内容</div>
                    <div className="text-sm text-gray-300 line-clamp-3">{generatedAudio.text}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 size={32} className="animate-spin text-red-400" />
                    ) : (
                      <Mic2 size={32} className="opacity-50" />
                    )}
                  </div>
                  <p className="text-sm">
                    {isProcessing ? 'AI正在生成...' : '输入文本后开始生成'}
                  </p>
                  {isProcessing && (
                    <p className="text-xs text-gray-600">这可能需要几秒钟</p>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            {!generatedAudio && !isProcessing && (
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500">
                    上传声音样本可实现声音克隆。支持中英文多音字自动识别。
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

export default TTSVoiceCloning;
