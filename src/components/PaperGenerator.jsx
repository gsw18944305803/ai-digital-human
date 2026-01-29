import React, { useState, useEffect } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { FileText, Loader2, Sparkles, Check, AlertCircle, Clock, Download, Copy, RefreshCw } from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const PaperGenerator = ({ featureKey = 'AI论文写作' }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('zh');
  const [model, setModel] = useState('gpt-4o-mini');
  const [taskId, setTaskId] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, generating, polling, success, error
  const [progress, setProgress] = useState(0);

  // 轮询结果
  useEffect(() => {
    if (taskId && status === 'polling') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${featureConfig.statusUrl}/${taskId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${featureConfig.apiKey}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📄 论文状态:', data);

            if (data.status === 'success' && data.result?.event === 'end_generate_article') {
              setResult(data.result.data);
              setStatus('success');
              setTaskId('');
              setProgress(100);
            } else if (data.status === 'failed') {
              setStatus('error');
              setTaskId('');
            } else {
              setProgress(prev => Math.min(prev + 10, 90));
            }
          }
        } catch (err) {
          console.error('轮询错误:', err);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [taskId, status, featureConfig]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('请输入论文主题');
      return;
    }

    setStatus('generating');
    setTaskId('');
    setResult(null);
    setProgress(0);

    try {
      const response = await fetch(featureConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: topic.trim(),
          language: language,
          model: model,
          output_content_type: 'Research Paper'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📄 提交成功:', data);
        setTaskId(data.task_id);
        setStatus('polling');
        setProgress(20);
      } else {
        throw new Error('提交失败');
      }
    } catch (err) {
      console.error('生成错误:', err);
      setStatus('error');
      alert(`生成失败: ${err.message}`);
    }
  };

  const formatPaperContent = (data) => {
    if (!data) return '';

    // 从information中提取内容
    const sections = data.information || [];
    let content = '';

    sections.forEach((section, index) => {
      if (section.perspective) {
        content += `## ${section.perspective}\n\n`;
      }
      if (section.dlg_turns && section.dlg_turns.length > 0) {
        section.dlg_turns.forEach(turn => {
          if (turn.agent_utterance) {
            content += `${turn.agent_utterance}\n\n`;
          }
        });
      }
    });

    return content;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatPaperContent(result));
    setTimeout(() => {
      const btn = document.querySelector('[data-copy="true"]');
      if (btn) {
        btn.textContent = '已复制！';
        setTimeout(() => btn.textContent = '复制内容', 2000);
      }
    }, 100);
  };

  const handleDownload = () => {
    const content = formatPaperContent(result);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.substring(0, 20)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 论文写作</h1>
          <p className="text-sm text-gray-500">基于AI技术，快速生成专业学术论文</p>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          {/* 论文主题 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <Sparkles size={16} className="inline mr-1" />
                论文主题
              </label>
              <PromptOptimizer
                value={topic}
                onOptimized={setTopic}
                featureKey="AI提示词专家"
                featureContext="当前使用AI论文写作功能，用户需要输入论文主题。优化时使主题更加明确、具体，包含研究方向、方法论、预期成果等学术要素。"
                buttonClassName="text-xs px-2 py-1"
              />
            </div>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="请输入论文主题，例如：人工智能在医疗领域的应用研究"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-32 text-gray-900 bg-white"
            />
          </div>

          {/* 配置选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">模型</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (推荐)</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={status === 'generating' || status === 'polling' || !topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
          >
            {status === 'generating' || status === 'polling' ? (
              <>
                <Loader2 className="animate-spin" />
                {status === 'generating' ? '提交中...' : '生成中...'}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                开始生成论文
              </>
            )}
          </button>
        </div>
      </div>

      {/* 进度显示 */}
      {(status === 'generating' || status === 'polling') && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="animate-spin text-purple-500" />
            <span className="font-medium text-gray-700">
              {status === 'generating' ? '正在提交...' : 'AI 正在撰写论文，请稍候...'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">这可能需要几分钟时间，请耐心等待...</p>
        </div>
      )}

      {/* 结果区域 */}
      {status === 'success' && result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">论文生成完成！</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                data-copy="true"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
              >
                <Copy size={16} />
                <span>复制内容</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors"
              >
                <Download size={16} />
                <span>下载</span>
              </button>
            </div>
          </div>

          {/* 论文内容预览 */}
          <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              {formatPaperContent(result).split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.substring(3)}</h3>;
                }
                return <p key={i} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-2" size={48} />
          <p className="text-red-600 font-medium">生成失败，请稍后重试</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重新尝试
          </button>
        </div>
      )}

      {/* 初始提示 */}
      {status === 'idle' && (
        <div className="text-center text-gray-400 mt-20">
          <FileText size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">输入论文主题开始生成</p>
          <p className="text-sm mt-2">支持生成各类型学术论文和研究报告</p>
        </div>
      )}
    </div>
  );
};

export default PaperGenerator;
