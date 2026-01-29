import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Download, RefreshCw, Wand2, ArrowRight, Layers, LayoutGrid, User, Camera, Languages } from 'lucide-react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { generateDoubaoImage } from '../../services/doubaoService';
import PromptOptimizer from '../PromptOptimizer';

// --- 子布局组件 ---

// 1. 左右布局 (DrawingRobot, ImageTranslation)
const SplitLayout = ({ title, description, onUpload, onGenerate, isGenerating, resultImage, originalImage, prompt, setPrompt }) => (
  <div className="flex flex-col lg:flex-row gap-6 h-full">
    <div className="lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Upload size={20} className="text-blue-500" /> 上传原图
      </h3>
      <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group">
        <input type="file" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
        {originalImage ? (
          <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} />
            </div>
            <p className="text-gray-500 font-medium">点击或拖拽上传图片</p>
            <p className="text-gray-400 text-xs mt-2">支持 JPG, PNG</p>
          </div>
        )}
      </div>

      {title === '绘画机器人' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">画面描述 (Prompt)</label>
            <PromptOptimizer
              value={prompt}
              onOptimized={setPrompt}
              featureKey="绘画机器人"
              featureContext="当前使用AI绘画功能，用户需要描述想要的画面。优化时使描述更加详细、具体，添加风格、色调、构图、光影等细节。"
              buttonClassName="text-xs px-2 py-1"
            />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 pr-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="描述你想要的画面细节..."
          />
        </div>
      )}

      <button 
        onClick={onGenerate}
        disabled={!originalImage || isGenerating}
        className={`mt-6 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
          ${!originalImage || isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}
        `}
      >
        {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 />}
        {isGenerating ? '正在生成中...' : '开始生成'}
      </button>
    </div>

    <div className="lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ImageIcon size={20} className="text-purple-500" /> 生成结果
      </h3>
      <div className="flex-1 bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden min-h-[300px]">
        {resultImage ? (
          <img src={resultImage} alt="Result" className="w-full h-full object-contain" />
        ) : (
          <div className="text-gray-500 flex flex-col items-center">
            <Layers size={48} className="text-gray-700 mb-4" />
            <p>等待生成结果...</p>
          </div>
        )}
      </div>
      {resultImage && (
        <a href={resultImage} download className="mt-4 w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
          <Download size={18} /> 下载图片
        </a>
      )}
    </div>
  </div>
);

// 2. 对比布局 (OldPhotoRestoration)
const CompareLayout = ({ onUpload, onGenerate, isGenerating, resultImage, originalImage }) => (
  <div className="h-full flex flex-col">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">老照片修复工作台</h2>
        <div className="flex gap-4">
          <label className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors font-medium">
            <input type="file" onChange={onUpload} className="hidden" accept="image/*" />
            上传老照片
          </label>
          <button 
            onClick={onGenerate}
            disabled={!originalImage || isGenerating}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2
              ${!originalImage || isGenerating ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30'}
            `}
          >
            {isGenerating ? '修复中...' : '一键修复'} <Wand2 size={16} />
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 grid grid-cols-2 gap-4 min-h-[400px]">
      <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg group">
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">修复前</div>
        {originalImage ? (
          <img src={originalImage} className="w-full h-full object-cover" alt="Before" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">请上传照片</div>
        )}
      </div>
      <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg">
        <div className="absolute top-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm z-10">修复后</div>
        {resultImage ? (
          <img src={resultImage} className="w-full h-full object-cover" alt="After" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">等待修复结果</div>
        )}
      </div>
    </div>
  </div>
);

// 3. 中心聚焦布局 (EcommerceScene)
const CenterFocusLayout = ({ onUpload, onGenerate, isGenerating, resultImage, originalImage }) => (
  <div className="max-w-4xl mx-auto h-full flex flex-col">
    <div className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden relative border border-gray-200 group">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
      
      {/* 结果展示区 */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        {resultImage ? (
           <img src={resultImage} className="max-w-full max-h-full shadow-2xl rounded-lg" alt="Result" />
        ) : originalImage ? (
           <img src={originalImage} className="max-w-[50%] max-h-[50%] shadow-xl rounded-lg opacity-80 grayscale transition-all duration-500 group-hover:grayscale-0" alt="Original" />
        ) : (
           <div className="text-center text-gray-400">
             <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
               <Camera size={40} />
             </div>
             <p className="text-xl">请上传商品白底图</p>
           </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-between">
         <div className="flex gap-4">
           <label className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 text-gray-600">
             <input type="file" onChange={onUpload} className="hidden" />
             <Upload size={20} />
           </label>
           <div className="h-12 w-px bg-gray-300"></div>
           <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 text-sm font-medium">极简风格</button>
           <button className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 text-sm font-medium hover:bg-gray-100">自然风光</button>
           <button className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 text-sm font-medium hover:bg-gray-100">室内家居</button>
         </div>
         <button 
           onClick={onGenerate}
           disabled={!originalImage || isGenerating}
           className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
         >
           {isGenerating ? '生成中...' : '生成场景图'}
         </button>
      </div>
    </div>
  </div>
);

// 4. 网格工具布局 (ImageToolbox)
const GridLayout = ({ onUpload, onGenerate, isGenerating, resultImage, originalImage }) => (
  <div className="flex gap-6 h-full">
    <div className="w-80 flex flex-col gap-4">
       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
         <h3 className="font-bold text-gray-800 mb-4">工具箱</h3>
         <div className="grid grid-cols-2 gap-3">
            {['画质增强', '色彩校正', '去雾', '锐化', '降噪', '风格化'].map(tool => (
              <button key={tool} className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center">
                {tool}
              </button>
            ))}
         </div>
       </div>
       <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800 mb-3 font-medium">当前操作</p>
          <div className="bg-white rounded-lg p-3 text-sm text-gray-600 shadow-sm">
             综合画质优化
          </div>
          <button 
            onClick={onGenerate}
            disabled={!originalImage || isGenerating}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? '处理中...' : '执行操作'}
          </button>
       </div>
    </div>
    <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center p-8 relative">
       <input type="file" onChange={onUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={!!originalImage} />
       {resultImage ? (
         <img src={resultImage} className="max-w-full max-h-full shadow-lg" alt="Result" />
       ) : originalImage ? (
         <img src={originalImage} className="max-w-full max-h-full shadow-lg" alt="Original" />
       ) : (
         <div className="text-center text-gray-400">
           <LayoutGrid size={48} className="mx-auto mb-4 opacity-50" />
           <p>拖拽图片到此处</p>
         </div>
       )}
       {originalImage && !resultImage && (
         <button onClick={() => window.location.reload()} className="absolute top-4 right-4 z-20 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500">
           <RefreshCw size={16} />
         </button>
       )}
    </div>
  </div>
);

// 5. 证件照布局 (IDPhotoGenerator)
const IDPhotoLayout = ({ onUpload, onGenerate, isGenerating, resultImage, originalImage }) => (
  <div className="flex flex-col lg:flex-row gap-8 h-full items-start">
    <div className="lg:w-1/3 w-full">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
         <div className="w-48 h-64 bg-gray-100 mx-auto rounded-lg mb-6 overflow-hidden relative group">
           {originalImage ? (
             <img src={originalImage} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
               <User size={32} className="mb-2" />
               <span className="text-xs">上传半身照</span>
             </div>
           )}
           <input type="file" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
           <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             更换照片
           </div>
         </div>
         <button 
           onClick={onGenerate}
           className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50"
           disabled={!originalImage || isGenerating}
         >
           {isGenerating ? '制作中...' : '生成证件照'}
         </button>
      </div>
    </div>
    
    <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-200 min-h-[500px]">
       <h3 className="font-bold text-gray-800 mb-6">预览结果</h3>
       <div className="flex gap-8 flex-wrap">
          {/* 模拟多种底色预览 */}
          {['bg-blue-500', 'bg-white border border-gray-200', 'bg-red-500'].map((bg, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
               <div className={`w-32 h-44 ${bg} rounded overflow-hidden relative shadow-sm`}>
                  {resultImage ? (
                    <img src={resultImage} className="w-full h-full object-cover mix-blend-multiply" /> 
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white/50">预览区</div>
                  )}
               </div>
               <span className="text-xs text-gray-500">{idx === 0 ? '标准蓝' : idx === 1 ? '白底' : '红底'}</span>
            </div>
          ))}
       </div>
    </div>
  </div>
);

// 6. 头像制作布局 (AvatarMaker)
const AvatarLayout = ({ onUpload, onGenerate, isGenerating, resultImage, originalImage }) => (
  <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center py-10">
     <div className="relative mb-12">
        <div className="w-64 h-64 rounded-full border-8 border-white shadow-2xl overflow-hidden relative z-10 bg-gray-100">
           {resultImage ? (
             <img src={resultImage} className="w-full h-full object-cover" />
           ) : originalImage ? (
             <img src={originalImage} className="w-full h-full object-cover grayscale opacity-50" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">
               <User size={64} />
             </div>
           )}
        </div>
        {/* 装饰圆环 */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 scale-110 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 scale-125"></div>
     </div>
     
     <div className="flex gap-4 mb-8">
        {['动漫风', '手绘风', '3D写实', '像素风'].map(style => (
          <button key={style} className="px-6 py-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all text-sm font-medium shadow-sm">
            {style}
          </button>
        ))}
     </div>

     <div className="flex gap-4">
       <label className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold cursor-pointer hover:bg-gray-200 transition-colors">
          <input type="file" onChange={onUpload} className="hidden" />
          上传照片
       </label>
       <button 
         onClick={onGenerate}
         disabled={!originalImage || isGenerating}
         className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
       >
         {isGenerating ? '绘制中...' : '生成头像'}
       </button>
     </div>
  </div>
);


// 7. 动态展示布局 (MotionLayout) - AI照片说话, AI 换衣, AI 矢量图生成, 图片竞技场, AI 3D 建模
const MotionLayout = ({ title, onUpload, onGenerate, isGenerating, resultImage, originalImage, prompt, setPrompt }) => (
  <div className="flex flex-col lg:flex-row gap-6 h-full">
    {/* 左侧：操作区 */}
    <div className="lg:w-1/3 flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-indigo-500" /> 上传素材
        </h3>
        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group min-h-[200px]">
          <input type="file" onChange={onUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
          {originalImage ? (
            <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={24} />
              </div>
              <p className="text-gray-500 font-medium text-sm">点击上传参考图</p>
            </div>
          )}
        </div>

        {/* 额外的控制选项 */}
        <div className="mt-4 space-y-3">
          {(title === 'AI 换衣' || title === 'AI照片说话' || title === 'AI 3D 建模') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-500">自定义描述 (可选)</label>
                <PromptOptimizer
                  value={prompt}
                  onOptimized={setPrompt}
                  featureKey={title}
                  featureContext={title === 'AI 换衣'
                    ? "当前使用AI换衣功能，用户需要描述想要的服装款式。优化时使描述更加详细，包含服装类型、颜色、风格、材质等细节。"
                    : title === 'AI照片说话'
                    ? "当前使用AI照片说话功能，用户需要描述想要表达的动作或表情。优化时使描述更加生动、具体。"
                    : "当前使用AI 3D建模功能，用户需要描述3D模型的要求。优化时使描述更加详细、具体。"}
                  buttonClassName="text-xs px-2 py-1"
                />
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 pr-24 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 h-20 resize-none"
                placeholder={title === 'AI 换衣' ? "描述想要的服装款式，例如：白色连衣裙..." : "描述动作或表情..."}
              />
            </div>
          )}
        </div>

        <button 
          onClick={onGenerate}
          disabled={!originalImage || isGenerating}
          className={`mt-6 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
            ${!originalImage || isGenerating ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30'}
          `}
        >
          {isGenerating ? 'AI处理中...' : '立即生成'} <Wand2 size={16} />
        </button>
      </div>
    </div>

    {/* 右侧：展示区 */}
    <div className="lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles size={120} />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
        <Layers size={20} className="text-pink-500" /> 生成预览
      </h3>
      
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center relative overflow-hidden min-h-[400px]">
        {resultImage ? (
          <img src={resultImage} alt="Result" className="w-full h-full object-contain shadow-lg" />
        ) : (
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-white shadow-sm mb-4">
               {title === 'AI照片说话' ? <Video size={32} className="text-gray-300" /> : <ImageIcon size={32} className="text-gray-300" />}
            </div>
            <p className="text-gray-400 text-sm">AI 正在等待指令...</p>
          </div>
        )}
      </div>

      {resultImage && (
        <div className="mt-4 flex justify-end">
           <a href={resultImage} download className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm font-medium">
             <Download size={16} /> 下载结果
           </a>
        </div>
      )}
    </div>
  </div>
);

// --- 主控组件 ---

const ImageProcessingModule = ({ featureKey }) => {
  const config = useSystemConfig();
  const featureConfig = config.features[featureKey];
  
  // 主题检测
  const isDarkMode = document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light');
  
  const [originalImage, setOriginalImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        // 提取纯 Base64 (去除 data:image/xxx;base64, 前缀) 用于 API 提交
        const base64Data = reader.result.split(',')[1];
        setImageBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageBase64) return;
    if (!featureConfig?.apiKey || !featureConfig?.apiUrl) {
      alert('请先在系统配置中设置 API Key 和 接口地址');
      return;
    }

    setIsGenerating(true);
    try {
      // 组合提示词：系统预设 + 用户自定义
      const finalPrompt = `${featureConfig.systemPrompt || ''} ${customPrompt}`.trim();
      
      const imageUrl = await generateDoubaoImage(
        featureConfig.apiKey,
        featureConfig.apiUrl,
        featureConfig.resultUrl || (featureConfig.apiUrl + '_result'), // 简单的 fallback
        imageBase64,
        finalPrompt
      );
      
      setResultImage(imageUrl);
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`生成失败: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!featureConfig) {
    return <div className="p-8 text-center text-gray-500">该功能尚未配置，请联系管理员。</div>;
  }

  // 根据 featureKey 选择布局
  const renderLayout = () => {
    switch (featureKey) {
      case '绘画机器人':
      case 'AI 图片翻译':
      case 'AI绘图提示词专家': // 使用 SplitLayout
        return <SplitLayout 
          title={featureKey}
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
          prompt={customPrompt}
          setPrompt={setCustomPrompt}
        />;
      case 'AI老照片修复':
        return <CompareLayout 
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
        />;
      case 'AI电商场景图生成':
        return <CenterFocusLayout 
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
        />;
      case 'AI图片工具箱':
        return <GridLayout 
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
        />;
      case '证件照生成':
      case 'AI 红包封面生成': // 红包封面也可以用证件照的预览布局，稍微改改？或者用 MotionLayout
        return <IDPhotoLayout 
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
        />;
      case 'AI 头像制作':
        return <AvatarLayout 
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
        />;
      case 'AI照片说话':
      case 'AI 换衣':
      case 'AI 矢量图生成':
      case '图片竞技场':
      case 'AI 3D 建模':
        return <MotionLayout 
          title={featureKey}
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
          prompt={customPrompt}
          setPrompt={setCustomPrompt}
        />;
      default:
        return <SplitLayout 
          title={featureKey}
          onUpload={handleUpload} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
          resultImage={resultImage} 
          originalImage={originalImage}
          prompt={customPrompt}
          setPrompt={setCustomPrompt}
        />;
    }
  };

  return (
    <div className={`h-full p-6 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-ai-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-6 flex items-center justify-between">
           <div>
             <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{featureKey}</h1>
             <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI 驱动的专业图像处理工具</p>
           </div>
           <div className={`px-3 py-1 text-xs rounded-full font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
             Model: {featureConfig.modelName}
           </div>
        </div>
        <div className="flex-1 min-h-0">
          {/* 这里需要传递 isDarkMode 给子组件，或者子组件内部也检测 */}
          {/* 为了简化，我们直接修改子组件的样式，让它们支持深色模式。由于子组件是硬编码的 className，这里用 div 包裹并利用 CSS 级联或修改子组件代码 */}
          {/* 最好的方式是修改上面的子组件定义，将它们改为支持 dark mode */}
          <div className={`h-full rounded-3xl ${isDarkMode ? 'bg-white/5 border border-white/10' : ''} p-1`}>
             {renderLayout()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessingModule;
