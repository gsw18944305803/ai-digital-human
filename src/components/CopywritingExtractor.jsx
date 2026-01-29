import React, { useState } from 'react';
import {
  FileEdit,
  Loader2,
  Play,
  Download,
  Copy,
  Check,
  TrendingUp,
  Heart,
  MessageSquare,
  Hash,
  ExternalLink,
  Sparkles,
  Lightbulb,
  Target,
  AlertCircle
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const CopywritingExtractor = () => {
  const config = useSystemConfig();
  const [videoUrl, setVideoUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (!videoUrl.trim()) {
      alert('请输入视频链接');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Track user activity
      trackUserActivity('copywriting_extractor', 'extract', { url: videoUrl });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const systemPrompt = customPrompt || `你是一位专业的短视频文案分析专家。请分析用户提供的视频链接中的文案内容，并提供以下详细分析：

1. **文案提取**：完整提取视频中的口播文案、字幕、标题、描述等文字内容

2. **爆款要素分析**：
   - 开头黄金3秒：分析如何抓住用户注意力
   - 情绪触发点：识别文案中的情绪按钮
   - 互动引导：分析如何引导用户评论、点赞、转发
   - 价值输出：明确文案提供的价值点

3. **关键词提取**：提取核心关键词、话题标签、热搜词

4. **文案结构**：分析文案的叙事结构（起承转合）

5. **改进建议**：提供3-5条优化建议，使文案更具传播力

6. **改写方案**：提供3个不同风格的改写版本（情感型/干货型/互动型）

请以结构化的方式输出分析结果。`;

      const userPrompt = `请分析这个视频的文案：${videoUrl}`;

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
        throw new Error(data.error?.message || data.message || '分析失败');
      }

      const analysis = data.choices?.[0]?.message?.content || '未获取到分析结果';

      setResult({
        originalUrl: videoUrl,
        analysis: analysis,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analysis error:', error);
      alert(`分析失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;

    const content = `# AI文案分析报告
生成时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}

视频链接: ${result.originalUrl}

## 分析结果

${result.analysis}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `文案分析报告_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackUserActivity('copywriting_extractor', 'download', { url: result.originalUrl });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <FileEdit size={20} />
          </span>
          AI文案提取与分析
        </h2>
        <p className="text-gray-400 max-w-2xl">
          一键提取爆款视频文案，AI智能分析传播密码，提供多维度改写方案。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-6">

          {/* Video URL Input */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Play size={16} className="text-purple-400" />
                视频链接
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="粘贴抖音、快手、B站等视频链接..."
                className="w-full px-4 py-3 pl-11 bg-ai-card border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
              />
              <ExternalLink size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </section>

          {/* Custom Analysis Prompt */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-400" />
                自定义分析要求（可选）
              </div>
              <PromptOptimizer
                value={customPrompt}
                onOptimized={setCustomPrompt}
                featureKey="AI文案提取与分析"
                featureContext="当前使用AI文案分析功能，用户可以自定义分析维度和要求。优化时使分析要求更加专业、具体，明确需要分析哪些方面（如目标受众、平台特点、竞品对比等）。"
                buttonClassName="text-xs px-2 py-1"
              />
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：重点分析这个文案的情感触发点和用户互动引导方式，并给出改进建议..."
              className="w-full h-24 bg-ai-card border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all resize-none"
            />
          </section>

          {/* Analysis Features */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">爆款要素</div>
                  <div className="text-xs text-gray-500">黄金3秒+情绪触发</div>
                </div>
              </div>
            </div>
            <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                  <Heart size={20} className="text-pink-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">情感分析</div>
                  <div className="text-xs text-gray-500">情绪按钮识别</div>
                </div>
              </div>
            </div>
            <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">互动引导</div>
                  <div className="text-xs text-gray-500">评论/点赞/转发</div>
                </div>
              </div>
            </div>
            <div className="bg-ai-card/50 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Hash size={20} className="text-teal-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">关键词</div>
                  <div className="text-xs text-gray-500">热搜词+话题标签</div>
                </div>
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleExtract}
            disabled={isProcessing || !videoUrl}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || !videoUrl
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-purple-500/25 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI正在分析中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                开始分析文案
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">分析结果</span>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(result.analysis)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="复制"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="下载报告"
                  >
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {result ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Original URL */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">原视频链接</div>
                    <a
                      href={result.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {result.originalUrl.substring(0, 40)}...
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Analysis Result */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {result.analysis}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-xs text-gray-500 mb-2">快速操作</div>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCopy(result.analysis)}
                        className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy size={14} />
                        复制分析结果
                      </button>
                      <button
                        onClick={handleDownload}
                        className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={14} />
                        下载完整报告
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 size={32} className="animate-spin text-purple-400" />
                    ) : (
                      <Target size={32} className="opacity-50" />
                    )}
                  </div>
                  <p className="text-sm">
                    {isProcessing ? 'AI正在深度分析...' : '输入视频链接开始分析'}
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
                  <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500">
                    支持抖音、快手、B站、小红书等主流平台。粘贴视频链接后点击分析即可。
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

export default CopywritingExtractor;
