import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { crawlerService } from '../services/crawlerService';
import { Search, Database, Play, Loader2, CheckCircle, AlertCircle, Copy, Code } from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const CrawlerGenerator = () => {
  const config = useSystemConfig();
  const featureConfig = config.features['网页数据提取工具'];

  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('提取新闻标题、发布时间、正文内容、作者名称');
  const [schema, setSchema] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Schema, 3: Extracting, 4: Result

  // 1. 生成 Schema - 302.ai crawler API
  const handleGenerateSchema = async () => {
    if (!url.trim()) {
        setError('请输入目标网址');
        return;
    }
    setLoading(true);
    setError('');
    setStatusText('正在分析网页结构...');
    try {
      // 302.ai crawler: 直接使用默认schema，跳过generate-schema步骤
      const defaultSchema = {
          type: "object",
          properties: {
              title: { type: "string", description: "页面标题" },
              content: { type: "string", description: "主要内容" },
              author: { type: "string", description: "作者" },
              date: { type: "string", description: "发布日期" }
          }
      };

      setSchema(defaultSchema);
      setStep(2);
      console.log('✅ [Schema] 使用默认Schema:', defaultSchema);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 创建任务
  const handleCreateTask = async () => {
    setLoading(true);
    setError('');
    setStatusText('正在启动提取任务...');
    try {
      // 确保 schema 是对象
      let schemaObj = schema;
      if (typeof schema === 'string') {
          try { schemaObj = JSON.parse(schema); } catch (e) {}
      }

      const res = await crawlerService.createTask(featureConfig.apiKey, featureConfig.apiUrl, schemaObj, url, prompt);
      const tid = res.id || res.taskId || res.task_id || res.data?.id || res.data?.taskId;
      
      if (!tid) throw new Error('未获取到任务ID');
      
      setTaskId(tid);
      setStep(3);
      pollStatus(tid);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 3. 轮询 - 302.ai crawler API
  const pollStatus = async (tid) => {
    let attempts = 0;
    const maxAttempts = 60; // 2分钟

    const interval = setInterval(async () => {
      attempts++;
      try {
        console.log(`📊 [查询进度] TaskID: ${tid}, Attempt: ${attempts}/${maxAttempts}`);

        const res = await crawlerService.checkTask(featureConfig.apiKey, featureConfig.resultUrl, tid);
        console.log('📊 [查询进度] 响应:', res);

        const status = res.status || res.data?.status;

        setStatusText(`提取中... (${status || 'Processing'}) [${attempts}/${maxAttempts}]`);

        // 302.ai API: completed/succeeded = 成功, failed = 失败, processing = 处理中
        if (status === 'completed' || status === 'succeeded' || status === 'SUCCESS') {
          clearInterval(interval);

          // 提取结果 - 302.ai返回格式: { results: [{ url, screenshot, data, metadata, markdown }], ... }
          const results = res.results || res.data?.results || res.data || res;
          setResult(results);
          setStep(4);
          setLoading(false);

          console.log('✅ [提取成功] 结果已保存');
        } else if (status === 'failed' || status === 'FAILED' || status === 'error') {
          clearInterval(interval);
          const errorMsg = res.error || res.message || res.data?.error || '提取失败';
          throw new Error(errorMsg);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          throw new Error('任务处理超时，请稍后重试');
        }
      } catch (err) {
        clearInterval(interval);
        console.error('❌ [轮询错误]', err);
        setError(err.message);
        setStep(2); // 回退到步骤2
        setLoading(false);
      }
    }, 2000);
  };

  if (!featureConfig?.apiKey) {
      return <div className="p-10 text-center text-gray-500">请联系管理员配置 API Key</div>;
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">网页数据提取工具</h1>
          <p className="text-sm text-gray-500">基于 AI 的智能网页结构化数据提取</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 overflow-y-auto">
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span className="font-bold">Error:</span> {error}
            </div>
        )}

        {/* 步骤 1: 输入 */}
        {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">目标网址 URL</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full p-4 pl-12 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://example.com/news/123"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-gray-700">提取需求描述 (Prompt)</label>
                        <PromptOptimizer
                          value={prompt}
                          onOptimized={setPrompt}
                          featureKey="AI提示词专家"
                          featureContext="当前使用网页数据提取工具功能，用户需要描述要提取的数据字段。优化时使描述更加明确、具体，列出需要提取的所有字段名和数据类型。"
                          buttonClassName="text-xs px-2 py-1"
                        />
                    </div>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                        placeholder="描述你需要提取的字段，例如：文章标题、作者、正文、评论数..."
                    />
                </div>

                <button 
                    onClick={handleGenerateSchema}
                    disabled={loading || !url.trim()}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Code />}
                    生成提取结构 (Schema)
                </button>
            </div>
        )}

        {/* 步骤 2: 确认 Schema */}
        {step === 2 && (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700">确认提取结构 (JSON Schema)</h3>
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-indigo-600">返回修改</button>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 font-mono text-sm overflow-auto mb-6">
                    <pre>{JSON.stringify(schema, null, 2)}</pre>
                </div>
                <button 
                    onClick={handleCreateTask}
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/30"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Play />}
                    开始提取数据
                </button>
            </div>
        )}

        {/* 步骤 3: 提取中 */}
        {step === 3 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">正在提取数据...</h3>
                <p className="text-gray-500 mt-2">{statusText}</p>
            </div>
        )}

        {/* 步骤 4: 结果 */}
        {step === 4 && (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={24} />
                        <h3 className="text-xl font-bold">提取成功</h3>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                                alert('已复制到剪贴板');
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 font-medium"
                         >
                            <Copy size={16} /> 复制结果
                         </button>
                         <button 
                            onClick={() => { setStep(1); setUrl(''); setResult(null); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                         >
                            提取下一个
                         </button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-900 rounded-xl p-6 font-mono text-sm text-green-400 overflow-auto shadow-inner">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CrawlerGenerator;
