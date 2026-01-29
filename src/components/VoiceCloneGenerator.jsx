import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import {
  Mic,
  Upload,
  Loader2,
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  FileAudio,
  Copy,
  Trash2,
  Volume2
} from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const VoiceCloneGenerator = ({ featureKey = 'AI语音生成器' }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  // 步骤状态
  const [currentStep, setCurrentStep] = useState(1); // 1: 上传样本, 2: 克隆音色, 3: 生成音频

  // 步骤1: 上传音频样本
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState('');
  const [isUploading, setIsUploading] = useState('');

  // 步骤2: 克隆音色
  const [voiceName, setVoiceName] = useState('');
  const [clonedVoiceId, setClonedVoiceId] = useState('');
  const [isCloning, setIsCloning] = useState('');

  // 步骤3: 生成音频
  const [textToSpeak, setTextToSpeak] = useState('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState('');

  // 保存的音色列表
  const [savedVoices, setSavedVoices] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API 配置
  const apiKey = featureConfig?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
  const uploadUrl = featureConfig?.uploadUrl || '/api/302/bigmodel/api/paas/v4/files';
  const cloneUrl = featureConfig?.cloneUrl || '/api/302/bigmodel/api/paas/v4/voice/clone';
  const ttsUrl = featureConfig?.ttsUrl || '/api/302/bigmodel/api/paas/v4/audio/transmissions';

  // 处理音频文件选择
  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('音频文件大小不能超过 10MB');
      return;
    }

    // 检查文件类型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      setError('请上传 MP3、WAV、M4A 或 OGG 格式的音频文件');
      return;
    }

    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setError('');
    setUploadedFileId('');
  };

  // 步骤1: 上传音频文件
  const handleUpload = async () => {
    if (!audioFile) {
      setError('请先选择音频文件');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('purpose', 'voice_clone');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error?.message || `上传失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('📤 上传结果:', data);

      const fileId = data.id || data.data?.id || data.file_id;
      if (!fileId) {
        throw new Error('未获取到文件ID');
      }

      setUploadedFileId(fileId);
      setSuccessMsg('音频样本上传成功！');
      setCurrentStep(2);
    } catch (err) {
      console.error('上传错误:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 步骤2: 克隆音色
  const handleClone = async () => {
    if (!uploadedFileId) {
      setError('请先上传音频样本');
      return;
    }

    if (!voiceName.trim()) {
      setError('请输入音色名称');
      return;
    }

    setIsCloning(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(cloneUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: uploadedFileId,
          name: voiceName.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error?.message || `克隆失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎭 克隆结果:', data);

      const voiceId = data.voice || data.data?.voice || data.voice_id;
      if (!voiceId) {
        throw new Error('未获取到音色ID');
      }

      setClonedVoiceId(voiceId);

      // 保存到音色列表
      const newVoice = {
        id: voiceId,
        name: voiceName.trim(),
        fileId: uploadedFileId,
        createdAt: new Date().toISOString()
      };
      setSavedVoices([...savedVoices, newVoice]);

      setSuccessMsg(`音色"${voiceName}"克隆成功！音色ID: ${voiceId}`);
      setCurrentStep(3);
    } catch (err) {
      console.error('克隆错误:', err);
      setError(err.message);
    } finally {
      setIsCloning(false);
    }
  };

  // 步骤3: 生成音频
  const handleGenerate = async () => {
    if (!textToSpeak.trim()) {
      setError('请输入要生成的文本');
      return;
    }

    if (!clonedVoiceId) {
      setError('请先克隆音色');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'glm-tts',
          voice: clonedVoiceId,
          text: textToSpeak.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error?.message || `生成失败: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔊 生成结果:', data);

      const audioUrl = data.url || data.data?.url || data.audio_url;
      if (!audioUrl) {
        throw new Error('未获取到音频URL');
      }

      setGeneratedAudioUrl(audioUrl);
      setSuccessMsg('音频生成成功！');
    } catch (err) {
      console.error('生成错误:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制音色ID
  const copyVoiceId = (id) => {
    navigator.clipboard.writeText(id);
    setSuccessMsg('音色ID已复制到剪贴板');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  // 选择已保存的音色
  const selectVoice = (voice) => {
    setClonedVoiceId(voice.id);
    setVoiceName(voice.name);
    setCurrentStep(3);
    setSuccessMsg(`已选择音色: ${voice.name}`);
  };

  // 删除音色
  const deleteVoice = (voiceId) => {
    setSavedVoices(savedVoices.filter(v => v.id !== voiceId));
    if (clonedVoiceId === voiceId) {
      setClonedVoiceId('');
      setVoiceName('');
    }
    setSuccessMsg('音色已删除');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  // 重置流程
  const resetFlow = () => {
    setCurrentStep(1);
    setAudioFile(null);
    setAudioPreview(null);
    setUploadedFileId('');
    setVoiceName('');
    setClonedVoiceId('');
    setGeneratedAudioUrl('');
    setError('');
    setSuccessMsg('');
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
    <div className="h-full flex flex-col max-w-6xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl shadow-lg">
          <Mic size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 音色克隆</h1>
          <p className="text-sm text-gray-500">3秒语音样本克隆说话者的音色与语气习惯</p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: '上传音频样本', icon: Upload },
            { num: 2, title: '克隆音色', icon: Copy },
            { num: 3, title: '生成音频', icon: Volume2 }
          ].map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${
                      isCurrent ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：操作区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 步骤1: 上传音频样本 */}
          <div
            className={`bg-white rounded-2xl shadow-sm border transition-all ${
              currentStep === 1 ? 'border-pink-300 ring-2 ring-pink-100' : 'border-gray-200'
            } p-6`}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-pink-500" />
              上传音频样本
            </h3>

            {!audioPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                    <FileAudio size={32} className="text-pink-500" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">点击上传音频文件</p>
                  <p className="text-sm text-gray-500">支持 MP3、WAV、M4A、OGG 格式</p>
                  <p className="text-xs text-gray-400 mt-2">文件大小不超过 10MB，建议时长 3-30 秒</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <audio src={audioPreview} controls className="w-full" />
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 truncate">{audioFile.name}</span>
                  <button
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview(null);
                      setUploadedFileId('');
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      上传样本
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 步骤2: 克隆音色 */}
          <div
            className={`bg-white rounded-2xl shadow-sm border transition-all ${
              currentStep === 2 ? 'border-pink-300 ring-2 ring-pink-100' : 'border-gray-200'
            } p-6`}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Copy size={20} className="text-pink-500" />
              克隆音色
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  音色名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="给这个音色起个名字，如：温柔女声、磁性男声"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  disabled={!uploadedFileId}
                />
              </div>

              {uploadedFileId && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <CheckCircle size={16} className="inline mr-1" />
                    音频样本已上传，文件ID: {uploadedFileId.slice(0, 20)}...
                  </p>
                </div>
              )}

              <button
                onClick={handleClone}
                disabled={!uploadedFileId || isCloning || !voiceName.trim()}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="animate-spin" />
                    克隆中...
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    开始克隆
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 步骤3: 生成音频 */}
          <div
            className={`bg-white rounded-2xl shadow-sm border transition-all ${
              currentStep === 3 ? 'border-pink-300 ring-2 ring-pink-100' : 'border-gray-200'
            } p-6`}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Volume2 size={20} className="text-pink-500" />
              生成音频
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    要生成的文本 <span className="text-red-500">*</span>
                  </label>
                  <PromptOptimizer
                    value={textToSpeak}
                    onOptimized={setTextToSpeak}
                    featureKey="AI语音生成器"
                    featureContext="当前使用AI语音生成功能，用户需要输入要转换为语音的文本。优化时使文本更加自然、流畅，添加适当的标点符号和停顿提示，适合语音朗读。"
                    buttonClassName="text-xs px-2 py-1"
                  />
                </div>
                <textarea
                  value={textToSpeak}
                  onChange={(e) => setTextToSpeak(e.target.value)}
                  placeholder="输入要朗读的文本内容..."
                  rows={4}
                  className="w-full p-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                  disabled={!clonedVoiceId}
                />
              </div>

              {clonedVoiceId && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <CheckCircle size={16} className="inline mr-1" />
                    当前使用音色: {voiceName}
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!clonedVoiceId || isGenerating || !textToSpeak.trim()}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    生成音频
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：已保存的音色和结果 */}
        <div className="space-y-6">
          {/* 已保存的音色 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">已保存的音色</h3>
            {savedVoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">暂无保存的音色</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedVoices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      clonedVoiceId === voice.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => selectVoice(voice)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{voice.name}</p>
                        <p className="text-xs text-gray-500 truncate">ID: {voice.id}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVoice(voice.id);
                        }}
                        className="text-red-400 hover:text-red-600 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 生成的音频 */}
          {generatedAudioUrl && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                生成完成
              </h3>
              <audio src={generatedAudioUrl} controls className="w-full mb-4" />
              <a
                href={generatedAudioUrl}
                download="cloned-voice.mp3"
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors no-underline"
              >
                <Download size={16} />
                下载音频
              </a>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <button
              onClick={resetFlow}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              重新开始
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 shrink-0" size={20} />
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-pink-50 rounded-xl p-6">
        <h3 className="font-bold text-pink-800 mb-3">使用说明</h3>
        <ol className="text-sm text-pink-700 space-y-2 list-decimal list-inside">
          <li>上传一个3-30秒的音频样本（MP3/WAV/M4A/OGG格式，最大10MB）</li>
          <li>为音色命名，系统将提取音频中的音色特征</li>
          <li>使用克隆的音色生成任意文本的语音</li>
          <li>保存的音色可以重复使用，无需重新克隆</li>
        </ol>
        <p className="text-xs text-pink-600 mt-4">
          注意：音色克隆需要消耗 API 配额，每次克隆费用约 $0.9
        </p>
      </div>
    </div>
  );
};

export default VoiceCloneGenerator;
