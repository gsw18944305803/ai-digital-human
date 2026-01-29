import React, { useState } from 'react';
import {
  FileText,
  Loader2,
  Upload,
  Mic,
  Video,
  FileAudio,
  Download,
  Copy,
  Check,
  BookOpen,
  FileEdit,
  Sparkles,
  Type,
  List,
  Heading1,
  Image as ImageIcon,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const AudioVideoToArticle = () => {
  const config = useSystemConfig();
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [articleStyle, setArticleStyle] = useState('detailed');
  const [outputFormat, setOutputFormat] = useState('markdown');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = React.useRef(null);

  const articleStyles = [
    { id: 'detailed', name: '详细长文', desc: '适合公众号、博客', icon: BookOpen },
    { id: 'concise', name: '精简摘要', desc: '适合快速阅读', icon: FileText },
    { id: 'social', name: '社交媒体', desc: '适合微博、小红书', icon: Sparkles },
    { id: 'news', name: '新闻报道', desc: '专业新闻风格', icon: FileEdit },
  ];

  const outputFormats = [
    { id: 'markdown', name: 'Markdown', icon: Type },
    { id: 'html', name: 'HTML', icon: Code },
    { id: 'plain', name: '纯文本', icon: FileText },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['audio/', 'video/'];
      if (!validTypes.some(type => file.type.startsWith(type))) {
        alert('请上传音频或视频文件');
        return;
      }

      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('文件大小不能超过 500MB');
        return;
      }

      setUploadedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      setMediaUrl('');
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConvert = async () => {
    if (!mediaUrl.trim() && !uploadedFile) {
      alert('请输入媒体链接或上传文件');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      trackUserActivity('audio_video_to_article', 'convert', {
        type: uploadedFile ? 'file' : 'url',
        style: articleStyle,
        format: outputFormat
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const styleDescriptions = {
        detailed: '详细长文风格：完整的文章结构，包含引言、多个章节、结论，字数2000字以上',
        concise: '精简摘要风格：提炼核心观点，分点列出，字数500-800字',
        social: '社交媒体风格：轻松活泼，使用emoji，分段短小，适合快速阅读',
        news: '新闻报道风格：客观中立，倒金字塔结构，包含5W1H要素'
      };

      const formatDescriptions = {
        markdown: '使用Markdown格式（# 标题，**加粗**，- 列表等）',
        html: '使用HTML格式（<h1>标题</h1>，<strong>加粗</strong>，<ul>列表</ul>等）',
        plain: '纯文本格式，不使用任何标记'
      };

      const systemPrompt = customPrompt || `你是一位专业的内容创作者和编辑，擅长将音视频内容转化为高质量的文章。

## 任务要求
将用户提供的音视频内容转化为一篇结构完整、逻辑清晰的文章。

## 文章风格
${styleDescriptions[articleStyle]}

## 输出格式
${formatDescriptions[outputFormat]}

## 转化要求
1. **内容理解**：准确理解音视频的核心内容和观点
2. **结构优化**：为文章添加清晰的标题、小标题、段落结构
3. **语言润色**：将口语化表达转化为书面语，保持专业性和可读性
4. **信息补充**：适当补充背景信息，使文章更加完整
5. **重点突出**：使用加粗、列表等方式突出关键信息
6. **阅读体验**：确保文章流畅易读，符合所选风格的写作规范

## 文章结构
- 吸引眼球的标题
- 简短的导语/引言（100-150字）
- 主体内容（分3-5个小节）
- 总结/结论
- （可选）相关标签/话题

请开始转化，直接输出文章内容，不要有过多的开场白。`;

      const userPrompt = uploadedFile
        ? `请将我上传的音视频文件转化为文章，文件名：${uploadedFile.name}，文件类型：${uploadedFile.type}`
        : `请将这个音视频链接的内容转化为文章：${mediaUrl}`;

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
          max_tokens: 8000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || '转化失败');
      }

      const article = data.choices?.[0]?.message?.content || '未获取到文章内容';

      setResult({
        article: article,
        style: articleStyle,
        format: outputFormat,
        source: uploadedFile ? uploadedFile.name : mediaUrl,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Conversion error:', error);
      alert(`转化失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;

    const extensions = {
      markdown: 'md',
      html: 'html',
      plain: 'txt'
    };

    const blob = new Blob([result.article], {
      type: result.format === 'html' ? 'text/html' : 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `文章_${Date.now()}.${extensions[result.format]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackUserActivity('audio_video_to_article', 'download', { format: result.format });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FileAudio size={20} />
          </span>
          音视频转文章
        </h2>
        <p className="text-gray-400 max-w-2xl">
          一键将音视频内容转化为高质量文章，支持多种文章风格和输出格式。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-6">

          {/* Media Input */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Video size={16} className="text-blue-400" />
              媒体来源
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* URL Input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      if (e.target.value) handleRemoveFile();
                    }}
                    placeholder="粘贴音视频链接..."
                    disabled={!!uploadedFile}
                    className="w-full px-4 py-3 pl-11 bg-ai-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all disabled:opacity-50"
                  />
                  <ExternalLink size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-ai-card border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <Upload size={18} />
                  上传文件
                </label>
              </div>
            </div>

            {/* File Preview */}
            {uploadedFile && (
              <div className="bg-ai-card/50 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      {uploadedFile.type.startsWith('audio/') ? (
                        <Mic size={20} className="text-blue-400" />
                      ) : (
                        <Video size={20} className="text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-white">{uploadedFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Article Style Selection */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <BookOpen size={16} className="text-green-400" />
              文章风格
            </div>
            <div className="grid grid-cols-2 gap-3">
              {articleStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setArticleStyle(style.id)}
                  className={`relative p-3 rounded-xl border transition-all ${
                    articleStyle === style.id
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-ai-card border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <style.icon size={16} className={articleStyle === style.id ? 'text-blue-400' : 'text-gray-500'} />
                    <div className="text-left">
                      <div className={`text-sm font-medium ${articleStyle === style.id ? 'text-white' : 'text-gray-300'}`}>
                        {style.name}
                      </div>
                      <div className="text-xs text-gray-500">{style.desc}</div>
                    </div>
                  </div>
                  {articleStyle === style.id && (
                    <Check size={14} className="absolute top-2 right-2 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Output Format */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Type size={16} className="text-purple-400" />
              输出格式
            </div>
            <div className="flex gap-3">
              {outputFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setOutputFormat(format.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm transition-all ${
                    outputFormat === format.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-ai-card border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <format.icon size={14} className="inline mr-1" />
                  {format.name}
                </button>
              ))}
            </div>
          </section>

          {/* Custom Prompt */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileEdit size={16} className="text-yellow-400" />
                自定义要求（可选）
              </div>
              <PromptOptimizer
                value={customPrompt}
                onOptimized={setCustomPrompt}
                featureKey="音视频转文章"
                featureContext="当前使用音视频转文章功能，用户可以自定义文章风格、结构、字数等要求。优化时使要求更加明确、具体，如目标读者、文章用途、特殊格式要求等。"
                buttonClassName="text-xs px-2 py-1"
              />
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：文章目标读者是科技爱好者，需要加入一些技术细节和行业分析..."
              className="w-full h-20 bg-ai-card border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none"
            />
          </section>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isProcessing || (!mediaUrl && !uploadedFile)}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || (!mediaUrl && !uploadedFile)
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-blue-500/25 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI正在转化中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                开始转化
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">转化结果</span>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="复制"
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

            <div className="flex-1 p-6 overflow-y-auto">
              {result ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Article Info */}
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">风格: {articleStyles.find(s => s.id === result.style)?.name}</span>
                      <span className="text-gray-500">格式: {outputFormats.find(f => f.id === result.format)?.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      来源: {result.source}
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                      {result.article}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={14} />
                      复制全文
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      下载文章
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 size={32} className="animate-spin text-blue-400" />
                    ) : (
                      <FileText size={32} className="opacity-50" />
                    )}
                  </div>
                  <p className="text-sm">
                    {isProcessing ? 'AI正在生成文章...' : '上传媒体或输入链接开始转化'}
                  </p>
                  {isProcessing && (
                    <p className="text-xs text-gray-600">这可能需要几秒钟</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioVideoToArticle;
