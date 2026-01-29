import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { LayoutGrid, Loader2, Sparkles, Download, Image as ImageIcon, Palette, Calendar, Type, Globe, QrCode } from 'lucide-react';
import PromptOptimizer from './PromptOptimizer';

const CardGenerator = ({ featureKey = 'AI卡片生成' }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  // 27种预设风格
  const styles = [
    { id: 0, name: '随机风格' },
    { id: 1, name: '优雅复古风格 Elegant Vintage' },
    { id: 2, name: '大胆现代风格 Bold Modern' },
    { id: 3, name: '极简主义风格 Minimalist' },
    { id: 4, name: '未来科技风格 Futuristic Tech' },
    { id: 5, name: '斯堪的纳维亚风格 Scandinavian' },
    { id: 6, name: '艺术装饰风格 Art Deco' },
    { id: 7, name: '日式极简风格 Japanese Minimalism' },
    { id: 8, name: '后现代解构风格 Postmodern Deconstruction' },
    { id: 9, name: '朋克风格 Punk' },
    { id: 10, name: '英伦摇滚风格 British Rock' },
    { id: 11, name: '黑金属风格 Black Metal' },
    { id: 12, name: '孟菲斯风格 Memphis Design' },
    { id: 13, name: '赛博朋克风格 Cyberpunk' },
    { id: 14, name: '波普艺术风格 Pop Art' },
    { id: 15, name: '瑞士国际主义风格的解构版 Deconstructed Swiss Style' },
    { id: 16, name: '蒸汽波美学 Vaporwave Aesthetics' },
    { id: 17, name: '新表现主义风格 Neo-Expressionism' },
    { id: 18, name: '新未来主义 Neo-Futurism' },
    { id: 19, name: '超现实主义数字拼贴 Surrealist Digital Collage' },
    { id: 20, name: '新巴洛克数字风格 Neo-Baroque Digital' },
    { id: 21, name: '液态数字形态主义 Liquid Digital Morphism' },
    { id: 22, name: '超感官极简主义 Hypersensory Minimalism' },
    { id: 23, name: '新表现主义数据可视化 Neo-Expressionist Data Visualization' },
    { id: 24, name: '维多利亚风格 Victorian Style' },
    { id: 25, name: '包豪斯风格 Bauhaus' },
    { id: 26, name: '构成主义风格 Constructivism' },
    { id: 27, name: '德国表现主义风格 German Expressionism' }
  ];

  const models = [
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo'
  ];

  const [content, setContent] = useState('');
  const [customStyle, setCustomStyle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lang, setLang] = useState('zh');
  const [qrContent, setQrContent] = useState('');
  const [model, setModel] = useState('claude-3-7-sonnet-20250219');
  const [isExtract, setIsExtract] = useState(false);
  const [saveFormat, setSaveFormat] = useState('png');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert('请输入主题内容');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const requestBody = {
        model: model,
        style: selectedStyle,
        content: content.trim(),
        date: date,
        lang: lang,
        is_extract: isExtract,
        save_format: saveFormat
      };

      // 如果有自定义风格，优先使用
      if (customStyle.trim()) {
        requestBody.custom_style = customStyle.trim();
      }

      // 如果有二维码内容
      if (qrContent.trim()) {
        requestBody.qr_code = {
          content: qrContent.trim()
        };
      }

      const response = await fetch('/api/302/302/card/generate/knowledge_card', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎴 卡片生成结果:', data);

        if (data.status === 'success') {
          setResult(data.data);
        } else {
          throw new Error('生成失败');
        }
      } else {
        throw new Error('API请求失败');
      }
    } catch (err) {
      console.error('生成错误:', err);
      setError(err.message);
      alert(`生成失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.file?.url) {
      window.open(result.file.url, '_blank');
    } else if (result?.content) {
      // 如果没有文件URL，创建一个HTML文件
      const blob = new Blob([result.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!featureConfig?.apiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <QrCode size={48} className="mx-auto mb-4 opacity-50" />
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
          <LayoutGrid size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 卡片生成</h1>
          <p className="text-sm text-gray-500">基于AI技术，快速生成精美的知识卡片</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* 左侧：输入区域 */}
        <div className="w-1/2 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
            {/* 主题内容 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Type size={16} className="inline mr-1" />
                  主题内容
                </label>
                <PromptOptimizer
                  value={content}
                  onOptimized={setContent}
                  featureKey="AI提示词专家"
                  featureContext="当前使用AI卡片生成功能，用户需要输入卡片主题或金句。优化时使主题更加精炼、富有诗意或哲理。"
                  buttonClassName="text-xs px-2 py-1"
                />
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="输入你想要生成卡片的主题或金句，例如：青春的韶华、知识就是力量等..."
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none h-28 text-gray-900 bg-white"
              />
            </div>

            {/* 模型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI 模型</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 风格选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette size={16} className="inline mr-1" />
                预设风格
              </label>
              <select
                value={selectedStyle}
                onChange={e => setSelectedStyle(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                {styles.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* 自定义风格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">自定义风格（可选）</label>
              <input
                type="text"
                value={customStyle}
                onChange={e => setCustomStyle(e.target.value)}
                placeholder="例如：海洋风格、森林风格、科技风格..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">优先级高于预设风格</p>
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                卡片日期
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              />
            </div>

            {/* 语言 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe size={16} className="inline mr-1" />
                语言
              </label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* 二维码内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <QrCode size={16} className="inline mr-1" />
                二维码内容（可选）
              </label>
              <input
                type="text"
                value={qrContent}
                onChange={e => setQrContent(e.target.value)}
                placeholder="输入要生成二维码的内容，如网址、文本等..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-gray-900 bg-white"
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={loading || !content.trim()}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  生成卡片
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧：预览区域 */}
        <div className="w-1/2 overflow-y-auto">
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-pink-500">AI</span>
                </div>
              </div>
              <p className="text-gray-600">AI 正在生成卡片，请稍候...</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">生成结果</h2>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 flex items-center gap-2 transition-colors"
                >
                  <Download size={16} />
                  下载
                </button>
              </div>

              {/* HTML预览 */}
              <div
                className="bg-gray-50 rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: result.content }}
              />

              {/* 文件信息 */}
              {result.file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>格式：</strong>{result.file.format}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    <strong>链接：</strong>
                    <a href={result.file.url} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">
                      {result.file.url}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">在左侧输入内容后点击生成</p>
              <p className="text-sm text-gray-400 mt-2">支持27种精美风格</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
