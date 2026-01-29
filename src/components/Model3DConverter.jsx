import React, { useState } from 'react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { Box, Loader2, Upload, Download, FileArchive, CheckCircle, AlertCircle } from 'lucide-react';

const Model3DConverter = ({ featureKey = 'AI 3D 建模' }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];

  const outputFormats = [
    { value: 'obj', name: 'OBJ', description: '通用3D模型格式' },
    { value: 'stl', name: 'STL', description: '3D打印常用格式' },
    { value: 'glb', name: 'GLB', description: 'GLTF二进制格式' }
  ];

  const [fileUrl, setFileUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState('obj');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!fileUrl.trim()) {
      alert('请输入3D模型文件URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/302/302/3d/format_convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${featureConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trimesh_file_url: fileUrl.trim(),
          output_format: outputFormat
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎲 3D转换结果:', data);
        setResult(data);
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || '转换失败');
      }
    } catch (err) {
      console.error('转换错误:', err);
      setError(err.message);
      alert(`转换失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    if (!result) return;

    // 下载所有模型文件
    result.models_urls?.forEach((url, index) => {
      window.open(url, '_blank');
    });

    // 下载所有纹理文件
    result.textures_urls?.forEach((url, index) => {
      setTimeout(() => window.open(url, '_blank'), 500);
    });
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
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-lg">
          <Box size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI 3D建模</h1>
          <p className="text-sm text-gray-500">3D模型文件格式转换，支持OBJ/STL/GLB格式</p>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-5">
          {/* 文件URL输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload size={16} className="inline mr-1" />
              3D模型文件URL
            </label>
            <input
              type="text"
              value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              placeholder="输入3D建模文件压缩包的URL（.zip格式）"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 bg-white"
            />
            <p className="text-xs text-gray-500 mt-2">
              需要是公网可访问的3D建模文件压缩包URL，支持多种3D格式
            </p>
          </div>

          {/* 输出格式选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">目标格式</label>
            <div className="grid grid-cols-3 gap-4">
              {outputFormats.map(format => (
                <button
                  key={format.value}
                  onClick={() => setOutputFormat(format.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    outputFormat === format.value
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 hover:border-amber-300 text-gray-600'
                  }`}
                >
                  <div className="font-bold text-lg">{format.name}</div>
                  <div className="text-xs mt-1 opacity-70">{format.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 转换按钮 */}
          <button
            onClick={handleConvert}
            disabled={loading || !fileUrl.trim()}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                转换中...
              </>
            ) : (
              <>
                <Box size={20} />
                开始转换
              </>
            )}
          </button>
        </div>
      </div>

      {/* 转换结果 */}
      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              <h2 className="text-xl font-bold text-gray-800">转换成功！</h2>
            </div>
            <button
              onClick={handleDownloadAll}
              className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 flex items-center gap-2 transition-colors font-medium"
            >
              <Download size={18} />
              下载全部文件
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 模型文件 */}
            {result.models_urls && result.models_urls.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Box size={18} className="text-amber-500" />
                  模型文件 ({result.models_urls.length})
                </h3>
                <div className="space-y-2">
                  {result.models_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        model_{index + 1}.{outputFormat}
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
                      >
                        下载
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 纹理文件 */}
            {result.textures_urls && result.textures_urls.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileArchive size={18} className="text-orange-500" />
                  纹理文件 ({result.textures_urls.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.textures_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xs text-gray-600 truncate flex-1">
                        texture_{index + 1}
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        下载
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-2" size={48} />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            关闭
          </button>
        </div>
      )}

      {/* 初始提示 */}
      {!result && !error && !loading && (
        <div className="text-center text-gray-400 mt-20">
          <FileArchive size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">输入3D模型文件URL开始转换</p>
          <p className="text-sm mt-2">支持将各种3D格式转换为OBJ、STL、GLB格式</p>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-3">使用说明</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• 请提供公网可访问的3D建模文件压缩包URL（.zip格式）</li>
          <li>• <strong>OBJ格式</strong>：通用的3D模型交换格式，支持几何和纹理数据</li>
          <li>• <strong>STL格式</strong>：主要用于3D打印，仅包含几何信息</li>
          <li>• <strong>GLB格式</strong>：GLTF的二进制版本，适合Web3D应用</li>
          <li>• 转换完成后可分别下载模型文件和纹理文件</li>
        </ul>
      </div>
    </div>
  );
};

export default Model3DConverter;
