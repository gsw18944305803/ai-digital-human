import React, { useState } from 'react';
import { Sparkles, Send, Copy, RefreshCw, Settings, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

const UniversalGenerator = ({ title }) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setResult(`这是为您生成的关于“${title}”的结果：\n\n根据您的输入“${inputText}”，我们为您完成了相应的处理任务。\n\n[模拟结果内容...]\n1. 智能分析完成\n2. 核心要素提取\n3. 优化建议生成`);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-400">
          智能AI助手为您服务，请输入您的需求，我们将快速为您生成高质量结果。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <FileText size={18} />
                </span>
                <div className="text-sm font-medium">输入需求</div>
              </div>
              <button 
                onClick={() => setInputText('')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                清空
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 bg-ai-dark/40 border border-white/5 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-500 outline-none resize-none focus:border-blue-500/50 transition-colors"
                placeholder={`请输入${title}相关的具体描述或要求...`}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                {inputText.length} 字
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Settings size={14} />
                <span>高级选项</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 rounded-lg bg-ai-dark/60 border border-white/5 text-xs text-gray-400 hover:text-gray-200 hover:border-white/10 transition-all text-left">
                  智能模式 (默认)
                </button>
                <button className="px-3 py-2 rounded-lg bg-ai-dark/60 border border-white/5 text-xs text-gray-400 hover:text-gray-200 hover:border-white/10 transition-all text-left">
                  专业模式
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                isGenerating || !inputText.trim()
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-purple-500'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>正在处理...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>开始生成</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <section className="bg-ai-card border border-white/5 rounded-2xl p-6 h-full min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <CheckCircle size={18} />
                </span>
                <div className="text-sm font-medium">生成结果</div>
              </div>
              {result && (
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="复制">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="重新生成">
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <div className="flex-1 bg-ai-dark/40 rounded-xl border border-white/5 p-6 animate-in fade-in duration-500">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-200 leading-relaxed">
                  {result}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-ai-dark/20 rounded-xl border border-dashed border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-gray-600">
                  <Sparkles size={32} />
                </div>
                <p className="text-sm">结果将在此处展示</p>
                <p className="text-xs text-gray-600 mt-2">请在左侧输入内容并点击生成</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UniversalGenerator;
