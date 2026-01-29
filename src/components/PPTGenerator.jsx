import React, { useState, useEffect } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { pptService } from '../services/pptService';
import { FileText, Play, Download, Layout, RefreshCw, CheckCircle, Loader2, Filter, Eye } from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const PPTGenerator = () => {
  const config = useSystemConfig();
  const featureConfig = config.features['AI PPT制作'];

  const [mode, setMode] = useState('topic'); // 'topic' | 'file'
  const [topic, setTopic] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [step, setStep] = useState(1); // 1: Topic/File, 2: Outline, 3: Generating, 4: Result
  const [outline, setOutline] = useState(null); // 用于显示的字符串格式大纲
  const [outlineData, setOutlineData] = useState(null); // 原始API响应对象，用于PPT生成

  // 模板与筛选
  const [templates, setTemplates] = useState([]);
  const [templateOptions, setTemplateOptions] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null); // 模板预览

  const [taskId, setTaskId] = useState(null);
  const [pptResult, setPptResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');

  // 初始化：加载模板列表和模板选项
  useEffect(() => {
    if (featureConfig?.apiKey) {
        // 加载模板列表
        if (featureConfig.templatesListUrl) {
            pptService.getTemplates(featureConfig.apiKey, featureConfig.templatesListUrl)
                .then(res => {
                    if (res && res.data) setTemplates(res.data);
                })
                .catch(console.warn);
        }
        
        // 加载模板选项 (分类/比例等)
        if (featureConfig.templateUrl) {
            pptService.getTemplateOptions(featureConfig.apiKey, featureConfig.templateUrl)
                .then(res => {
                    if (res) setTemplateOptions(res);
                })
                .catch(console.warn);
        }
    }
  }, [featureConfig]);

  // 1. 生成大纲
  const handleGenerateOutline = async () => {
    if (mode === 'topic' && !topic.trim()) return;
    if (mode === 'file' && !fileUrl.trim()) return;

    setLoading(true);
    setError('');
    try {
      let res;
      if (mode === 'topic') {
        res = await pptService.generateOutline(featureConfig.apiKey, featureConfig.outlineUrl, topic);
      } else {
        // 文件模式：先解析文件
        res = await pptService.parseFile(featureConfig.apiKey, featureConfig.parseUrl, fileUrl);
      }

      // 兼容返回结构
      const outlineData = res.data || res.outline || res;

      // 存储原始对象用于PPT生成
      setOutlineData(outlineData);

      // 提取纯文字内容用于显示和编辑
      let displayOutline = '';
      if (typeof outlineData === 'string') {
        displayOutline = outlineData;
      } else {
        // 尝试提取text字段或格式化sections
        if (outlineData.text) {
          displayOutline = outlineData.text;
        } else if (outlineData.data?.text) {
          displayOutline = outlineData.data.text;
        } else if (outlineData.data?.result?.text) {
          displayOutline = outlineData.data.result.text;
        } else if (outlineData.sections && Array.isArray(outlineData.sections)) {
          // 如果是sections数组，格式化为可读文本
          displayOutline = outlineData.sections.map((section, index) => {
            if (section.type === 'text') {
              return section.content;
            } else if (section.type === 'image') {
              return `[图片: ${section.content}]`;
            }
            return '';
          }).filter(s => s).join('\n\n');
        } else {
          // 兜底：格式化JSON显示
          displayOutline = JSON.stringify(outlineData, null, 2);
        }
      }

      setOutline(displayOutline);
      setStep(2);
    } catch (err) {
      setError(err.message || '生成大纲失败');
    } finally {
      setLoading(false);
    }
  };

  // 2. 提交生成任务 (同步接口)
  const handleGeneratePPT = async () => {
    if (!selectedTemplate) {
        setError('请选择一个模板');
        return;
    }
    setLoading(true);
    setStep(3);
    setError('');
    try {
      // 使用 outlineData (原始对象) 而不是解析后的字符串
      const dataToUse = outlineData || { text: outline };

      // 使用同步PPT生成接口 (generatepptx)
      const res = await pptService.generateContent(
        featureConfig.apiKey,
        featureConfig.syncPptUrl,  // 使用同步接口
        dataToUse,
        selectedTemplate.id
      );

      // 同步接口直接返回PPT信息，不需要轮询
      const pptInfo = res.data?.pptInfo || res.pptInfo || res.data;
      if (!pptInfo) {
        throw new Error('未获取到PPT信息');
      }

      setPptResult(pptInfo);
      setStep(4);
      setLoading(false);
    } catch (err) {
      setError(err.message || '生成PPT失败');
      setStep(2);
      setLoading(false);
    }
  };

  // 3. 轮询状态
  const pollStatus = async (tid) => {
    let attempts = 0;
    const maxAttempts = 120; // 4分钟
    
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await pptService.checkStatus(featureConfig.apiKey, featureConfig.statusUrl, tid);
        const status = res.status || res.data?.status; 
        
        setStatusText(`生成中... (${status || 'Processing'})`);

        if (status === 'SUCCEEDED' || status === 'SUCCESS') {
          clearInterval(interval);
          setPptResult(res.data || res.output); 
          setStep(4);
          setLoading(false);
        } else if (status === 'FAILED') {
          clearInterval(interval);
          throw new Error(res.error || '生成失败');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          throw new Error('生成超时');
        }
      } catch (err) {
        clearInterval(interval);
        setError(err.message);
        setStep(2);
        setLoading(false);
      }
    }, 2000);
  };

  // 下载处理 - 使用fetch下载并指定正确的文件名
  const handleDownload = async () => {
      const directUrl = pptResult.fileUrl || pptResult.ppt_url || pptResult.url;

      if (directUrl) {
          console.log('📥 开始下载PPT:', directUrl);

          try {
              // 使用fetch下载文件
              const response = await fetch(directUrl);
              if (!response.ok) throw new Error(`下载失败: ${response.status}`);

              const blob = await response.blob();
              console.log('📥 Blob类型:', blob.type);
              console.log('📥 Blob大小:', blob.size, 'bytes');

              // 从URL提取文件名，或者使用PPT的name作为文件名
              let fileName = 'AI_PPT.pptx';

              // 优先使用pptResult中的name
              if (pptResult.name) {
                  fileName = pptResult.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') + '.pptx';
              } else {
                  // 从URL提取文件名
                  const urlFileName = directUrl.split('/').pop();
                  if (urlFileName && urlFileName.includes('.pptx')) {
                      fileName = urlFileName;
                  } else if (urlFileName) {
                      fileName = urlFileName + '.pptx';
                  }
              }

              console.log('📥 下载文件名:', fileName);

              // 创建下载链接
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.style.display = 'none';

              document.body.appendChild(a);
              a.click();

              // 清理
              setTimeout(() => {
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
              }, 100);

              console.log('✅ 下载触发成功');
              return;
          } catch (e) {
              console.error('❌ 下载失败:', e);
              alert('下载失败，请重试。错误: ' + e.message);
              return;
          }
      }

      console.error('❌ 未找到下载链接，pptResult:', pptResult);
      alert('未获取到下载链接');
  };

  // 在线预览PPT
  const handlePreview = () => {
      const fileUrl = pptResult.fileUrl || pptResult.ppt_url || pptResult.url;
      if (fileUrl) {
          // 使用Office Online Viewer预览
          const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
          window.open(officeViewerUrl, '_blank');
      } else {
          alert('未获取到预览链接');
      }
  };

  // 筛选模板逻辑
  const filteredTemplates = templates.filter(t => {
      if (selectedCategory === 'all') return true;
      // 假设模板对象有 category 字段，或者根据 options 匹配
      // 如果 API 返回的 tags/categories 结构不确定，这里做个简单兼容
      return t.category === selectedCategory || (t.tags && t.tags.includes(selectedCategory));
  });

  // 获取模板预览图 - 兼容多种字段名和嵌套结构
  const getTemplateCover = (t) => {
      // 302.ai API返回的字段是 coverUrl (驼峰命名)
      // 直接字段 - 优先使用 coverUrl
      const directFields = t.coverUrl || t.cover || t.preview || t.thumb || t.thumbnail || t.cover_url || t.preview_url || t.image || t.url;

      // 嵌套字段 (data.coverUrl, data.cover, etc.)
      const nestedFields = t.data?.coverUrl || t.data?.cover || t.data?.preview || t.template?.coverUrl || t.template?.cover;

      return directFields || nestedFields;
  };

  // 提取分类选项 - 安全处理不同API响应格式
  const categories = templateOptions?.categories ||
                    (templateOptions?.data && Array.isArray(templateOptions.data) ? templateOptions.data.map(c => c.name || c) : []) ||
                    (templateOptions?.tags && Array.isArray(templateOptions.tags) ? templateOptions.tags : []) ||
                    ['商务', '教育', '科技', '简约']; // 默认兜底

  if (!featureConfig?.apiKey) {
      return <div className="p-10 text-center text-gray-500">请联系管理员配置 PPT API Key</div>;
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <Layout size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI PPT 制作</h1>
          <p className="text-sm text-gray-600">输入主题或上传文档，一键生成精美演示文稿</p>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="flex justify-between mb-8 px-20 relative">
         <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
         <div className={`absolute top-1/2 left-0 h-1 bg-red-500 -z-10 transition-all duration-500`} style={{width: `${((step - 1) / 3) * 100}%`}}></div>
         {[1, 2, 3, 4].map((s) => (
             <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors z-10 ${step >= s ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                 {step > s ? <CheckCircle size={20} /> : s}
             </div>
         ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 overflow-y-auto">
        {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                <span className="font-bold">Error:</span> {error}
            </div>
        )}

        {step === 1 && (
            <div className="max-w-2xl mx-auto text-center mt-6">
                <div className="flex justify-center gap-4 mb-8">
                    <button 
                        onClick={() => setMode('topic')}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${mode === 'topic' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
                    >
                        主题生成
                    </button>
                    <button 
                        onClick={() => setMode('file')}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${mode === 'file' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
                    >
                        文档解析
                    </button>
                </div>

                {mode === 'topic' ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-bold text-gray-800">输入演示文稿主题</h2>
                          <PromptOptimizer
                            value={topic}
                            onOptimized={setTopic}
                            featureKey="AI提示词专家"
                            featureContext="当前使用AI PPT制作功能，用户需要输入PPT主题。优化时使主题更加明确、具体，包含演讲对象、时长、风格等细节要求。"
                          />
                        </div>
                        <textarea
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none text-lg text-gray-900 bg-white mb-6 placeholder-gray-400"
                            placeholder="例如：2024年人工智能行业发展趋势报告，包含市场规模、技术突破和未来展望..."
                        />
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">解析在线文档</h2>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-blue-700 mb-2">请输入文档 URL (PDF/Word/Markdown):</p>
                            <input
                                type="text"
                                value={fileUrl}
                                onChange={e => setFileUrl(e.target.value)}
                                className="w-full p-3 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                                placeholder="https://example.com/document.pdf"
                            />
                            <p className="text-xs text-blue-400 mt-2">* 暂仅支持公网可访问的文档链接</p>
                        </div>
                    </>
                )}

                <button 
                    onClick={handleGenerateOutline}
                    disabled={loading || (mode === 'topic' ? !topic.trim() : !fileUrl.trim())}
                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <FileText />}
                    {mode === 'topic' ? '生成大纲' : '解析并生成大纲'}
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="font-bold mb-4 text-gray-800 text-lg">1. 确认/编辑大纲</h3>
                    <textarea
                        value={outline || ''}
                        onChange={e => setOutline(e.target.value)}
                        className="flex-1 p-4 border border-gray-300 rounded-xl font-mono text-sm text-gray-900 bg-white focus:bg-white focus:ring-2 focus:ring-red-500 transition-colors outline-none resize-none mb-4 lg:mb-0 placeholder-gray-400"
                        placeholder="大纲内容将显示在这里..."
                    />
                </div>
                <div className="w-full lg:w-96 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-800 text-lg">2. 选择模板</h3>
                         {/* 简单的分类筛选 */}
                         {categories.length > 0 && (
                            <div className="relative group">
                                <button className="p-1 rounded hover:bg-gray-100 text-gray-600"><Filter size={16}/></button>
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-20 hidden group-hover:block p-1">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gray-50 ${selectedCategory === 'all' ? 'text-red-600 font-bold' : 'text-gray-700'}`}
                                    >
                                        全部
                                    </button>
                                    {categories.map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedCategory(c)}
                                            className={`block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gray-50 ${selectedCategory === c ? 'text-red-600 font-bold' : 'text-gray-700'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>

                    {/* 模板列表 - 改为两列网格 */}
                    <div className="flex-1 overflow-y-auto pr-2 min-h-[300px]">
                        {filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredTemplates.map(t => {
                                    const coverUrl = getTemplateCover(t);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t)}
                                            className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all relative group
                                                ${selectedTemplate?.id === t.id ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300'}
                                            `}
                                        >
                                            {/* 预览图 */}
                                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative" onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewTemplate(t);
                                            }}>
                                                {coverUrl ? (
                                                    <img
                                                        src={coverUrl}
                                                        className="w-full h-full object-cover"
                                                        alt={t.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextElementSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                {/* 占位图 */}
                                                <div className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${coverUrl ? 'hidden' : ''}`}>
                                                    <Layout size={32} className="mb-1 opacity-30" />
                                                    <span className="text-xs font-medium truncate px-1">{t.name || '模板'}</span>
                                                </div>
                                                {/* 预览按钮 */}
                                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Eye className="text-white drop-shadow-lg" size={24} />
                                                </div>
                                                {selectedTemplate?.id === t.id && (
                                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                        <CheckCircle className="text-white drop-shadow-md" size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            {/* 模板名称 */}
                                            <div className="p-2 bg-white">
                                                <p className="text-xs font-medium text-gray-800 text-center truncate" title={t.name}>{t.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                暂无模板，请联系管理员检查配置
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleGeneratePPT}
                        disabled={loading || !selectedTemplate}
                        className="mt-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Play />}
                        开始生成 PPT
                    </button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-red-100 border-t-red-500 rounded-full animate-spin mb-6"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500">AI</span>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800">正在生成 PPT...</h3>
                <p className="text-gray-500 mt-2">{statusText || 'AI 正在撰写内容、设计排版和配图，请耐心等待'}</p>
                <div className="mt-8 max-w-md w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-red-500 animate-pulse w-2/3"></div>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
                    <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">生成成功！</h3>
                <p className="text-gray-500 mb-8">您的演示文稿已制作完成</p>

                {pptResult?.cover_url && (
                    <div className="mb-8 w-64 shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                        <img src={pptResult.cover_url} alt="Cover" className="w-full h-auto" />
                    </div>
                )}

                {/* 操作按钮组 */}
                <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
                    {/* 预览按钮 */}
                    <button
                        onClick={handlePreview}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                    >
                        <Eye size={20} /> 在线预览
                    </button>

                    {/* 下载按钮 */}
                    <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-500/30"
                    >
                        <Download size={20} /> 下载 PPTX
                    </button>

                    {/* 重新开始按钮 */}
                    <button
                        onClick={() => { setStep(1); setTopic(''); setFileUrl(''); setOutlineData(null); setPptResult(null); }}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={20} /> 再做一个
                    </button>
                </div>

                {/* 提示信息 */}
                <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-md">
                    <p className="text-sm text-blue-700">
                        💡 <strong>提示：</strong>点击"在线预览"可在浏览器中查看PPT内容，
                        确认无误后再下载到本地
                    </p>
                </div>
            </div>
        )}

        {/* 模板预览模态框 */}
        {previewTemplate && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewTemplate(null)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* 头部 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">{previewTemplate.name}</h3>
                        <button
                            onClick={() => setPreviewTemplate(null)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 预览图片 */}
                    <div className="p-6 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-[400px]">
                        {getTemplateCover(previewTemplate) ? (
                            <img
                                src={getTemplateCover(previewTemplate)}
                                alt={previewTemplate.name}
                                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        {/* 占位图 - 当没有预览图或加载失败时显示 */}
                        <div className={`flex-col items-center justify-center text-gray-400 ${getTemplateCover(previewTemplate) ? 'hidden' : ''} flex`}>
                            <Layout size={96} className="mb-4 opacity-30" />
                            <span className="text-lg font-medium">{previewTemplate.name || '模板预览'}</span>
                            <span className="text-sm mt-2 opacity-60">暂无预览图片</span>
                        </div>
                    </div>

                    {/* 底部操作 */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={() => setPreviewTemplate(null)}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            关闭
                        </button>
                        <button
                            onClick={() => {
                                setSelectedTemplate(previewTemplate);
                                setPreviewTemplate(null);
                            }}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            选择此模板
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PPTGenerator;