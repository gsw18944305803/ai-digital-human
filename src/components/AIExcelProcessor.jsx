import React, { useState } from 'react';
import {
  Database,
  Loader2,
  Upload,
  Download,
  FileSpreadsheet,
  Sparkles,
  Check,
  Trash2,
  Table,
  Calculator,
  Filter,
  SortAsc,
  GitMerge,
  FileText,
  Copy,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import PromptOptimizer from './PromptOptimizer';
import { trackUserActivity } from '../services/userActivityService';

const AIExcelProcessor = () => {
  const config = useSystemConfig();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [userRequest, setUserRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = React.useRef(null);

  const commonTasks = [
    { id: 'merge', name: '合并表格', desc: '将多个表格合并为一个', icon: GitMerge, prompt: '请帮我合并这些表格' },
    { id: 'filter', name: '数据筛选', desc: '按条件筛选数据', icon: Filter, prompt: '请帮我筛选出符合条件的数据' },
    { id: 'calculate', name: '公式计算', desc: '添加计算列和公式', icon: Calculator, prompt: '请帮我添加计算列，计算相关数据' },
    { id: 'format', name: '格式整理', desc: '统一格式和样式', icon: Table, prompt: '请帮我整理表格格式，使其更加规范' },
    { id: 'sort', name: '数据排序', desc: '按指定列排序', icon: SortAsc, prompt: '请帮我按指定列进行排序' },
    { id: 'summary', name: '数据汇总', desc: '生成汇总统计表', icon: FileText, prompt: '请帮我生成数据汇总统计表' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        alert('请上传Excel文件（.xlsx, .xls, .csv）');
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过 50MB');
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuickTask = (task) => {
    setUserRequest(prev => prev ? `${prev}\n${task.prompt}` : task.prompt);
  };

  const handleProcess = async () => {
    if (!uploadedFile && !userRequest.trim()) {
      alert('请上传Excel文件或输入处理需求');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      trackUserActivity('ai_excel_processor', 'process', {
        hasFile: !!uploadedFile,
        requestLength: userRequest.length
      });

      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/v1/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';

      const systemPrompt = `你是一位Excel数据处理专家，擅长处理各种复杂的Excel操作。

## 你的能力
1. **数据清洗**：删除重复、处理空值、统一格式
2. **数据合并**：多表合并、数据关联
3. **数据筛选**：按条件筛选、提取特定数据
4. **数据排序**：多列排序、自定义排序
5. **公式计算**：添加计算列、使用函数公式
6. **数据汇总**：数据透视、分类汇总、统计报表
7. **格式整理**：调整列宽、统一格式、美化表格
8. **数据分析**：趋势分析、对比分析、异常检测

## 工作流程
1. 理解用户的处理需求
2. 分析当前数据结构
3. 提供详细的操作步骤
4. 给出具体的公式或代码（如VBA、Python）
5. 说明操作注意事项

## 输出格式
请按以下结构输出：

### 📋 需求分析
简要说明用户的处理需求

### 📊 当前数据结构
描述数据表的字段和结构

### 🛠️ 处理步骤
详细的操作步骤，每一步都要说明清楚

### 📝 公式/代码
提供可直接使用的Excel公式、VBA代码或Python代码

### ⚠️ 注意事项
操作时需要注意的事项

### 💡 优化建议
进一步优化或自动化处理的建议

如果用户上传了文件，基于文件名和可能的用途进行分析。如果用户只描述了需求，提供通用的解决方案。`;

      let userPrompt = '';
      if (uploadedFile) {
        userPrompt = `我上传了一个Excel文件：${uploadedFile.name}，文件大小：${(uploadedFile.size / 1024).toFixed(2)} KB\n\n我的需求是：\n${userRequest || '请分析这个文件，告诉我如何处理它'}`;
      } else {
        userPrompt = userRequest;
      }

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
        throw new Error(data.error?.message || data.message || '处理失败');
      }

      const solution = data.choices?.[0]?.message?.content || '未获取到处理方案';

      setResult({
        solution: solution,
        fileName: uploadedFile?.name || '未上传文件',
        request: userRequest || '文件分析',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Processing error:', error);
      alert(`处理失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;

    const content = `# Excel处理方案
生成时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}
文件名: ${result.fileName}
处理需求: ${result.request}

## AI处理方案

${result.solution}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Excel处理方案_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackUserActivity('ai_excel_processor', 'download', { fileName: result.fileName });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <FileSpreadsheet size={20} />
          </span>
          AI自动化处理Excel
        </h2>
        <p className="text-gray-400 max-w-2xl">
          一句话搞定复杂表格操作，AI为您提供智能化的Excel解决方案。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-2 space-y-6">

          {/* File Upload */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Upload size={16} className="text-green-400" />
              上传Excel文件（可选）
            </div>

            {!uploadedFile ? (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 bg-ai-card/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                    <FileSpreadsheet size={32} className="text-green-400" />
                  </div>
                  <p className="text-white font-medium mb-1">点击或拖拽上传Excel文件</p>
                  <p className="text-sm text-gray-500">支持 .xlsx, .xls, .csv 格式，最大50MB</p>
                </label>
              </div>
            ) : (
              <div className="bg-ai-card/50 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <FileSpreadsheet size={24} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white">{uploadedFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Quick Tasks */}
          <section className="space-y-3">
            <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              常用操作（点击快速添加）
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {commonTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleQuickTask(task)}
                  className="p-3 bg-ai-card border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all text-left"
                >
                  <task.icon size={16} className="text-green-400 mb-2" />
                  <div className="text-sm text-white">{task.name}</div>
                  <div className="text-xs text-gray-500">{task.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* User Request */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Lightbulb size={16} className="text-blue-400" />
                描述您的处理需求
              </div>
              <PromptOptimizer
                value={userRequest}
                onOptimized={setUserRequest}
                featureKey="AI自动化处理Excel"
                featureContext="当前使用Excel处理功能，用户需要描述对Excel表格的操作需求。优化时使需求描述更加清晰、具体，明确操作类型、目标字段、预期结果等。"
                buttonClassName="text-xs px-2 py-1"
              />
            </div>

            <textarea
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              placeholder="描述您想要对Excel进行的操作，例如：
• 合并多个表格中的数据
• 筛选出销售额大于10000的记录
• 给所有价格打8折
• 按日期排序并生成汇总表"
              className="w-full h-32 bg-ai-card border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all resize-none"
            />
          </section>

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={isProcessing || (!uploadedFile && !userRequest.trim())}
            className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || (!uploadedFile && !userRequest.trim())
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                AI正在处理中...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                获取处理方案
              </>
            )}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1">
          <div className="bg-ai-card border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <span className="text-sm font-medium text-gray-300">处理方案</span>
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
                  {/* Info Card */}
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-gray-500">文件名</div>
                    <div className="text-sm text-white">{result.fileName}</div>
                  </div>

                  {/* Solution */}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {result.solution}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={14} />
                      复制方案
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      下载方案
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-4 h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {isProcessing ? (
                      <Loader2 size={32} className="animate-spin text-green-400" />
                    ) : (
                      <Table size={32} className="opacity-50" />
                    )}
                  </div>
                  <p className="text-sm">
                    {isProcessing ? 'AI正在分析...' : '上传文件或描述需求获取方案'}
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
                  <AlertCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>支持所有常见Excel操作：数据合并、筛选、排序、计算、汇总等。</div>
                    <div>上传文件可获得更精准的方案。</div>
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

export default AIExcelProcessor;
