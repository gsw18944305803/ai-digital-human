import React, { useState, useEffect } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { writingService } from '../services/writingService';
import { FileText, PenTool, Clipboard, RefreshCw, Loader2, Sparkles, BookOpen, Check, ArrowRight, Edit3, Lightbulb, List, ChevronRight } from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const WritingGenerator = ({ featureKey }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  // 检测当前主题
  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light')
  );

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(
            document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light')
          );
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // 模式：Copywriting (文案) vs LongText (长文)
  const mode = featureKey.includes('文档') ? 'longtext' : 'copywriting';

  const [input, setInput] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [result, setResult] = useState('');
  const [outline, setOutline] = useState(''); // 用于显示的大纲文本
  const [outlineData, setOutlineData] = useState(null); // 原始API响应对象
  const [loading, setLoading] = useState(false);
  const [loadingTools, setLoadingTools] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Outline(LongText only), 3: Result
  const [copied, setCopied] = useState(false);

  // 加载工具列表 (仅 Copywriting)
  useEffect(() => {
    if (mode === 'copywriting' && featureConfig?.toolsUrl && featureConfig?.apiKey) {
      setLoadingTools(true);
      writingService.getTools(featureConfig.apiKey, featureConfig.toolsUrl)
        .then(res => {
           const toolsList = Array.isArray(res) ? res : (res.data?.tools || []);
           setTools(toolsList);
           if (toolsList.length > 0) {
             setSelectedTool(toolsList[0]);
           }
        })
        .catch(err => {
           console.warn('Failed to load tools:', err);
        })
        .finally(() => {
           setLoadingTools(false);
        });
    }
  }, [mode, featureConfig]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');

    try {
      if (mode === 'copywriting') {
        // 使用302.ai Writing API生成文案
        if (!selectedTool) {
          throw new Error('请先选择一个文案工具');
        }

        // 构建参数
        const params = {};
        const toolParamKeys = Object.keys(selectedTool.params || {});

        // 根据工具参数构建请求 - 调整优先级
        if (toolParamKeys.includes('content')) {
          params.content = input.trim();
        } else if (toolParamKeys.includes('topic')) {
          params.topic = input.trim();
        } else if (toolParamKeys.includes('prompt')) {
          params.prompt = input.trim();
        } else if (toolParamKeys.includes('text')) {
          params.text = input.trim();
        } else {
          // 使用第一个可用参数（排除model和language）
          const firstParam = toolParamKeys.find(k => k !== 'model' && k !== 'language');
          if (firstParam) {
            params[firstParam] = input.trim();
          } else {
            // 如果没有找到任何参数，使用content作为默认
            params.content = input.trim();
          }
        }

        // 添加所有其他参数（设置为空字符串）
        toolParamKeys.forEach(key => {
          if (key !== 'model' && !params.hasOwnProperty(key)) {
            params[key] = '';
          }
        });

        // 确保语言参数存在（如果工具需要）
        if (toolParamKeys.includes('language') && !params.language) {
          params.language = 'Chinese';
        }

        const model = featureConfig.modelName || 'gpt-4o-mini';

        console.log('📝 [Writing API] 请求:', { tool_name: selectedTool.tool_name, model, params });

        const data = await writingService.generate(
          featureConfig.apiKey,
          featureConfig.apiUrl,
          selectedTool.tool_name,
          model,
          params
        );

        console.log('📝 [Writing API] 响应:', data);

        if (data.status === 'success' && data.result) {
          setResult(data.result);
        } else {
          throw new Error(data.message || '生成文案失败');
        }
        setStep(3);
      } else {
        // 长文：先生成大纲
        const model = featureConfig.modelName || 'gpt-4o-mini';
        const res = await writingService.generateOutline(
            featureConfig.apiKey,
            featureConfig.outlineUrl,
            input,
            model
        );
        // 解析大纲sections为可读格式
        let outlineText = '';
        if (res.data?.sections) {
          outlineText = res.data.sections.map((section, index) => {
            if (section.type === 'text') {
              return section.content;
            } else if (section.type === 'image') {
              return `[图片建议] ${section.content}`;
            }
            return '';
          }).filter(s => s).join('\n\n');
        } else {
          outlineText = res.outline || res.data?.outline || res.result || JSON.stringify(res);
        }
        setOutline(outlineText); // 存储大纲文本用于显示
        setOutlineData(res); // 存储原始API响应对象
        setResult(outlineText); // 同时显示大纲
        setStep(2);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLongText = async () => {
    setLoading(true);
    try {
        const model = featureConfig.modelName || 'gpt-4o-mini';
        // 优先使用原始API响应对象，如果没有则使用文本大纲
        const dataToUse = outlineData || outline;
        console.log('📝 [LongText] 使用数据:', outlineData ? '对象' : '文本');

        const res = await writingService.generateLongText(
            featureConfig.apiKey,
            featureConfig.apiUrl,
            dataToUse,
            model
        );
        // 提取内容并清理转义字符
        let content = res.content || res.data?.content || res.result || JSON.stringify(res);
        // 清理所有转义的换行符和其他转义字符
        content = content
          .replace(/\\n/g, '\n')      // 转义的换行符
          .replace(/\\"/g, '"')       // 转义的引号
          .replace(/\\\\/g, '\\');    // 转义的反斜杠
        setResult(content);
        setStep(3);
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setInput('');
    setResult('');
    setOutline('');
    setOutlineData(null);
  };

  if (!featureConfig?.apiKey) {
      return <div className="p-10 text-center text-gray-500">请联系管理员配置 API Key</div>;
  }

  // AI文档编辑器 - 全新设计
  if (mode === 'longtext') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-full px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                <BookOpen size={32} className="text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-800">AI文档编辑器</h1>
                <p className="text-gray-500">智能生成大纲 · 自动撰写长文</p>
              </div>
            </div>
          </div>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
              <span className="font-medium">输入主题</span>
            </div>
            <ChevronRight className={`transition-colors ${step >= 2 ? 'text-blue-500' : 'text-gray-300'}`} />
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div>
              <span className="font-medium">确认大纲</span>
            </div>
            <ChevronRight className={`transition-colors ${step >= 3 ? 'text-blue-500' : 'text-gray-300'}`} />
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">3</div>
              <span className="font-medium">生成正文</span>
            </div>
          </div>

          {/* 步骤 1: 输入主题 */}
          {step === 1 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Lightbulb className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">输入文档主题</h2>
                      <p className="text-gray-500 text-sm">描述你想要撰写的文档主题和要点</p>
                    </div>
                  </div>
                  {/* 提示词优化按钮 */}
                  <PromptOptimizer
                    value={input}
                    onOptimized={setInput}
                    featureKey="AI提示词专家"
                    featureContext="当前使用AI文档编辑器功能，用户需要输入文档主题或大纲。优化时使主题更加明确、具体，添加必要的背景和要点描述。"
                  />
                </div>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="w-full h-48 p-6 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-gray-700 bg-gray-50"
                  placeholder="例如：人工智能在教育领域的应用前景与挑战..."
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {loading ? '正在生成大纲...' : '生成文章大纲'}
              </button>
            </div>
          )}

          {/* 步骤 2: 确认大纲 */}
          {step === 2 && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                      <List className={`size={24} ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>文章大纲</h2>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>请确认大纲是否符合要求，可直接修改</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className={`px-4 py-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-sm`}
                  >
                    返回修改
                  </button>
                </div>
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  className={`w-full rounded-2xl p-6 border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[300px] max-h-96 overflow-y-auto ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 text-gray-700 placeholder-gray-400'
                  } font-sans leading-relaxed`}
                  placeholder="大纲内容..."
                />
              </div>

              <div className="flex gap-4 max-w-4xl mx-auto">
                <button
                  onClick={handleReset}
                  className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <RefreshCw size={20} />
                  重新生成大纲
                </button>
                <button
                  onClick={handleGenerateLongText}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Edit3 />}
                  {loading ? '正在生成正文...' : '生成正文内容'}
                </button>
              </div>
            </div>
          )}

          {/* 步骤 3: 显示结果 */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className={`flex items-center justify-between p-6 border-b ${
                  isDarkMode ? 'border-gray-700 bg-gradient-to-r from-green-900/20 to-emerald-900/20' : 'border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <Check className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>生成完成</h2>
                      <p className="text-green-600 text-sm">文档已成功生成</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`px-5 py-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-100'
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                      title={copied ? "已复制" : "复制"}
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Clipboard size={18} />}
                      {copied ? '已复制' : '复制'}
                    </button>
                    <button
                      onClick={handleReset}
                      className={`px-5 py-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-100'
                          : 'bg-white border-gray-200 text-gray-800'
                      }`}
                      title="重新开始"
                    >
                      <RefreshCw size={18} />
                      重新开始
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  {/* 格式化内容显示 */}
                  <div className={`prose prose-lg max-w-none ${
                    isDarkMode ? 'prose-invert prose-gray' : 'prose-gray'
                  }`}>
                    {result.split('\n\n').map((paragraph, index) => {
                      // 处理标题
                      if (paragraph.startsWith('## ')) {
                        return (
                          <h2 key={index} className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {paragraph.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h3 key={index} className={`text-xl font-bold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {paragraph.replace('### ', '')}
                          </h3>
                        );
                      }
                      // 处理列表项
                      if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                        return (
                          <li key={index} className={`ml-6 mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {paragraph.replace(/^[-•] /, '')}
                          </li>
                        );
                      }
                      // 处理编号列表
                      if (/^\d+\./.test(paragraph)) {
                        return (
                          <li key={index} className={`ml-6 mb-2 list-decimal ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {paragraph}
                          </li>
                        );
                      }
                      // 普通段落
                      return (
                        <p key={index} className={`mb-4 leading-loose text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI文案助手 / AI电商文案助手 - 原有设计
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
       <div className="flex items-center gap-3 mb-6">
         <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
           <PenTool size={24} />
         </div>
         <div>
           <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{featureKey}</h1>
           <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>选择工具 -> 快速生成</p>
         </div>
       </div>

       <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex overflow-hidden">
          {/* 左侧输入区 */}
          <div className={`w-1/3 p-6 flex flex-col ${
            isDarkMode
              ? 'bg-gray-800 border-r border-gray-700'
              : 'bg-gray-50 border-r border-gray-200'
          }`}>
             <div className="flex items-center justify-between mb-4">
               <h3 className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>输入需求</h3>
               <PromptOptimizer
                 value={input}
                 onOptimized={setInput}
                 featureKey="AI提示词专家"
                 featureContext={`当前使用${featureKey}功能，用户需要输入文案要求。优化时使要求更加明确、具体，包含目标受众、风格、场景等细节。`}
                 buttonClassName="text-xs px-2 py-1"
               />
             </div>
             <textarea
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 className={`flex-1 w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 resize-none mb-4 ${
                   isDarkMode
                     ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                     : 'bg-white border-gray-200 text-gray-700 placeholder-gray-400'
                 }`}
                 placeholder="输入文案要求..."
             />

             {mode === 'copywriting' && (
                 <div className="mb-4">
                     <label className={`block text-xs font-bold mb-2 uppercase ${
                       isDarkMode ? 'text-gray-400' : 'text-gray-500'
                     }`}>选择工具类型</label>
                     {loadingTools ? (
                         <div className={`w-full p-3 border rounded-lg text-sm text-center ${
                           isDarkMode
                             ? 'border-gray-600 text-gray-400'
                             : 'border-gray-200 text-gray-500'
                         }`}>
                             加载工具中...
                         </div>
                     ) : (
                         <select
                             value={selectedTool?.tool_name || ''}
                             onChange={e => {
                                 const tool = tools.find(t => t.tool_name === e.target.value);
                                 setSelectedTool(tool);
                             }}
                             className={`w-full p-2 border rounded-lg text-sm ${
                               isDarkMode
                                 ? 'bg-gray-700 border-gray-600 text-gray-100'
                                 : 'bg-white border-gray-200 text-gray-700'
                             }`}
                         >
                             {tools.map(t => (
                                 <option key={t.tool_name} value={t.tool_name}>{t.tool_name}</option>
                             ))}
                         </select>
                     )}
                     {selectedTool && (
                         <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                             {selectedTool.tool_description}
                         </div>
                     )}
                 </div>
             )}

             <button
                 onClick={handleGenerate}
                 disabled={loading || !input.trim()}
                 className="w-full py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                 {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                 立即生成
             </button>
          </div>

          {/* 右侧结果区 */}
          <div className={`flex-1 p-8 flex flex-col relative ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
             {result ? (
                 <>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={handleCopy}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}
                            title={copied ? "已复制" : "复制"}
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Clipboard size={18}/>}
                        </button>
                        <button
                            onClick={handleGenerate}
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}
                            title="重新生成"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto prose prose-blue max-w-none">
                        <pre className={`whitespace-pre-wrap font-sans leading-relaxed ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-800'
                        }`}>{result}</pre>
                    </div>
                 </>
             ) : (
                 <div className={`flex-1 flex flex-col items-center justify-center ${
                   isDarkMode ? 'text-gray-400' : 'text-gray-400'
                 }`}>
                     {loading ? (
                         <div className="text-center">
                             <Loader2 size={48} className="animate-spin mx-auto mb-4 text-purple-400" />
                             <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>AI 正在思考中...</p>
                         </div>
                     ) : (
                         <>
                             <FileText size={64} className="mb-4 opacity-20" />
                             <p>生成结果将显示在这里</p>
                         </>
                     )}
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default WritingGenerator;
