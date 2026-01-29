import React, { useState, useEffect } from 'react';
import { Save, Layers, Cpu, Database, Server, Image as ImageIcon, Video, Mic, Wand2, Eye, EyeOff, Wrench, Check, Pencil, Trash2, PlusCircle, Monitor, Sidebar as SidebarIcon, Menu } from 'lucide-react';
import { useSystemConfig, DEFAULT_CONFIG } from '../../hooks/useSystemConfig';

// 复制 Sidebar.jsx 中的菜单项定义，用于管理界面
const SIDEBAR_CATEGORIES = [
  {
    name: '图片处理',
    items: ['绘画机器人', 'AI老照片修复', 'AI电商场景图生成', 'AI图片工具箱', 'AI 图片翻译', '证件照生成', 'AI 头像制作', 'AI照片说话', 'AI 红包封面生成', 'AI 换衣', 'AI 矢量图生成', '图片竞技场', 'AI 3D 建模', 'AI绘图提示词专家']
  },
  {
    name: '信息处理',
    items: ['AI 聊天', 'AI翻译大师', 'AI提示词专家', 'AI搜索大师3.0', '网页数据提取工具']
  },
  {
    name: '工作效率',
    items: ['AI文案助手', 'AI电商文案助手', 'AI文档编辑器', 'AI PPT制作']
  },
  {
    name: '代码相关',
    items: ['AI网页生成器', 'AI网页生成器2.0', '代码竞技场', '网页一键部署']
  },
  {
    name: '学术相关',
    items: ['AI学术论文搜索', 'PDF全能工具箱', 'AI专利搜索', 'AI论文写作', 'AI答题机']
  },
  {
    name: '音频相关',
    items: ['AI语音生成器', 'AI 音乐制作', 'AI 播客制作', 'AI 语音通话', '语音竞技场']
  }
];

const SystemConfig = () => {
  const systemConfig = useSystemConfig();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState('models');
  const [visibleKeys, setVisibleKeys] = useState({});
  const [editingItems, setEditingItems] = useState({});

  useEffect(() => {
    if (systemConfig) {
       setConfig(systemConfig);
    }
  }, [systemConfig]);

  const handleSave = () => {
    localStorage.setItem('system_config', JSON.stringify(config));
    window.dispatchEvent(new Event('system_config_updated'));
    alert('系统配置已保存，部分功能可能需要刷新页面生效');
    setEditingItems({});
  };

  const handleModelChange = (key, field, value) => {
    setConfig(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [key]: {
          ...prev.models[key],
          [field]: value
        }
      }
    }));
  };
  
  // 处理备用节点变更
  const handleBackupChange = (modelKey, index, field, value) => {
    setConfig(prev => {
      const backups = [...(prev.models[modelKey].backups || [])];
      if (!backups[index]) backups[index] = {};
      backups[index][field] = value;
      return {
        ...prev,
        models: {
          ...prev.models,
          [modelKey]: {
            ...prev.models[modelKey],
            backups
          }
        }
      };
    });
  };

  const addBackup = (modelKey) => {
    setConfig(prev => ({
      ...prev,
      models: {
        ...prev.models,
        [modelKey]: {
          ...prev.models[modelKey],
          backups: [...(prev.models[modelKey].backups || []), { apiUrl: '', apiKey: '', note: '' }]
        }
      }
    }));
  };

  const removeBackup = (modelKey, index) => {
    setConfig(prev => {
      const backups = [...(prev.models[modelKey].backups || [])];
      backups.splice(index, 1);
      return {
        ...prev,
        models: {
          ...prev.models,
          [modelKey]: {
            ...prev.models[modelKey],
            backups
          }
        }
      };
    });
  };

  const handleFeatureChange = (featureName, field, value) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName]: {
          ...(prev.features?.[featureName] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleCozeChange = (key, field, value) => {
    setConfig(prev => ({
      ...prev,
      coze: {
        ...prev.coze,
        [key]: {
          ...prev.coze[key],
          [field]: value
        }
      }
    }));
  };

  const handleLayoutChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value
      }
    }));
  };

  const toggleSidebarItem = (itemName) => {
    setConfig(prev => {
      const hidden = prev.layout.hiddenSidebarItems || [];
      const newHidden = hidden.includes(itemName) 
        ? hidden.filter(i => i !== itemName)
        : [...hidden, itemName];
      
      return {
        ...prev,
        layout: {
          ...prev.layout,
          hiddenSidebarItems: newHidden
        }
      };
    });
  };

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEdit = (id) => {
    setEditingItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (key) => {
    switch (key) {
      case 'chat': return <Database size={18} />;
      case 'image': return <ImageIcon size={18} />;
      case 'video': case 'sora': return <Video size={18} />;
      case 'prompt': return <Wand2 size={18} />;
      case 'tts': return <Mic size={18} />;
      default: return <Server size={18} />;
    }
  };

  const renderApiKeyInput = (value, onChange, id, isEditing, placeholder="未配置") => (
    <div className="relative group w-full">
      <input
        type={visibleKeys[id] ? "text" : "password"}
        value={value || ''}
        onChange={onChange}
        disabled={!isEditing}
        className={`w-full border rounded-lg shadow-sm py-2.5 pl-3 pr-20 text-sm font-mono text-gray-900 transition-colors
          ${isEditing 
            ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white' 
            : 'border-transparent bg-gray-100 text-gray-600 cursor-not-allowed'
          }`}
        placeholder={isEditing ? (placeholder === "未配置" ? "sk-..." : placeholder) : placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
        <button
          type="button"
          onClick={() => toggleVisibility(id)}
          className="text-gray-500 hover:text-sky-600 cursor-pointer text-xs font-medium bg-transparent px-2 py-1"
        >
          {visibleKeys[id] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  const renderTextInput = (value, onChange, placeholder, isEditing) => (
    <input
      type="text"
      value={value || ''}
      onChange={onChange}
      disabled={!isEditing}
      className={`w-full border rounded-lg shadow-sm py-2.5 px-3 text-sm text-gray-900 transition-colors
        ${isEditing 
          ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white' 
          : 'border-transparent bg-gray-100 text-gray-600 cursor-not-allowed'
        }`}
      placeholder={placeholder}
    />
  );

  const renderEditButton = (id) => {
    const isEditing = editingItems[id];
    return (
      <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => toggleEdit(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${isEditing 
              ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md transform scale-105' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-sky-600'
            }`}
        >
          {isEditing ? <><Check size={16} /> 完成修改</> : <><Pencil size={16} /> 修改配置</>}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">系统配置管理</h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-green-500/20 font-medium"
        >
          <Save size={18} /> 全部保存
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'models', icon: Cpu, label: '功能接口配置' },
          { id: 'layout', icon: Layers, label: '页面布局' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-sky-500 text-sky-600 bg-sky-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 模型与功能接口 (合并) */}
      {activeTab === 'models' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          
          {/* A. 核心大模型配置 (Top 8) */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-900 shadow-sm">
              <h5 className="font-bold mb-1 flex items-center gap-2"><Cpu size={18}/> 核心功能与大模型配置 (Top 8)</h5>
              在此处配置最核心的8个“大功能”接口，包括AI对话、Sora视频、Coze智能体等。这些是系统的基石。
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* 1. Models (5个) */}
              {Object.entries(config.models || {}).map(([key, model]) => {
                const isEditing = editingItems[`models.${key}`];
                return (
                  <div key={key} className={`bg-white p-6 rounded-xl border transition-all duration-300 ${isEditing ? 'border-sky-400 shadow-md ring-1 ring-sky-100' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                      <span className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'}`}>
                        {getIcon(key)}
                      </span>
                      <h4 className="font-bold text-lg text-gray-800">{model.name}</h4>
                      <span className="ml-auto text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase font-mono">{key}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 主要接口配置 */}
                      <div className="md:col-span-2">
                         <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Server size={16}/> 主要接口节点</h5>
                      </div>
                      
                      {key === 'sora' || key === 'video' ? (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">提交任务接口 (POST)</label>
                            {renderTextInput(model.submitUrl || model.apiUrl, (e) => handleModelChange(key, 'submitUrl', e.target.value), "https://api.302.ai/openai/v1/videos", isEditing)}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">任务状态查询接口 (GET)</label>
                            {renderTextInput(model.statusUrl, (e) => handleModelChange(key, 'statusUrl', e.target.value), "https://api.302.ai/openai/v1/videos/{id}", isEditing)}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">视频内容查询接口 (GET)</label>
                            {renderTextInput(model.contentUrl, (e) => handleModelChange(key, 'contentUrl', e.target.value), "https://api.302.ai/openai/v1/videos/{id}/content", isEditing)}
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
                          {renderTextInput(model.apiUrl, (e) => handleModelChange(key, 'apiUrl', e.target.value), "https://api.openai.com/v1/...", isEditing)}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                        {renderApiKeyInput(model.apiKey, (e) => handleModelChange(key, 'apiKey', e.target.value), `models.${key}`, isEditing)}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">模型名称</label>
                        {renderTextInput(model.modelName, (e) => handleModelChange(key, 'modelName', e.target.value), "例如: gpt-4o", isEditing)}
                      </div>

                      {/* 备用节点配置 */}
                      <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100 bg-gray-50 rounded-lg p-4">
                         <div className="flex justify-between items-center mb-3">
                            <h5 className="font-semibold text-gray-700 text-sm flex items-center gap-2"><Layers size={16}/> 备用接口节点 (预留)</h5>
                            {isEditing && (
                              <button onClick={() => addBackup(key)} className="text-xs flex items-center gap-1 bg-white border px-2 py-1 rounded hover:bg-sky-50 text-sky-600">
                                 <PlusCircle size={12}/> 添加节点
                              </button>
                            )}
                         </div>
                         
                         {(model.backups || []).map((backup, idx) => (
                           <div key={idx} className="mb-4 last:mb-0 bg-white p-3 rounded border border-gray-200 relative">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500">API URL (备用{idx+1})</label>
                                    {renderTextInput(backup.apiUrl, (e) => handleBackupChange(key, idx, 'apiUrl', e.target.value), "备用接口地址", isEditing)}
                                 </div>
                                 <div>
                                    <label className="text-xs text-gray-500">API Key</label>
                                    {renderApiKeyInput(backup.apiKey, (e) => handleBackupChange(key, idx, 'apiKey', e.target.value), `models.${key}.backup.${idx}`, isEditing, "备用 Key")}
                                 </div>
                                 <div>
                                    <label className="text-xs text-gray-500">备注</label>
                                    {renderTextInput(backup.note, (e) => handleBackupChange(key, idx, 'note', e.target.value), "例如: 302.ai 备用通道", isEditing)}
                                 </div>
                              </div>
                              {isEditing && (
                                <button onClick={() => removeBackup(key, idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                   <Trash2 size={14}/>
                                </button>
                              )}
                           </div>
                         ))}
                         {(model.backups || []).length === 0 && <p className="text-xs text-gray-400 text-center py-2">暂无备用节点</p>}
                      </div>
                    </div>
                    {renderEditButton(`models.${key}`)}
                  </div>
                );
              })}

              {/* 2. Coze (3个) - Merged here */}
              {Object.entries(config.coze || {}).map(([key, bot]) => {
                const isEditing = editingItems[`coze.${key}`];
                return (
                  <div key={key} className={`bg-white p-6 rounded-xl border transition-all ${isEditing ? 'border-purple-400 ring-1 ring-purple-100 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                      <span className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'}`}>
                        <Database size={18} />
                      </span>
                      <h4 className="font-bold text-lg text-gray-800">{bot.name}</h4>
                      <span className="ml-auto text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase font-mono">coze.{key}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bot ID</label>
                        {renderTextInput(bot.botId, (e) => handleCozeChange(key, 'botId', e.target.value), "Bot ID", isEditing)}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token (PAT)</label>
                        {renderApiKeyInput(bot.apiToken, (e) => handleCozeChange(key, 'apiToken', e.target.value), `coze.${key}`, isEditing)}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Workflow ID (可选)</label>
                        {renderTextInput(bot.workflowId, (e) => handleCozeChange(key, 'workflowId', e.target.value), "Workflow ID", isEditing)}
                      </div>
                    </div>
                    {renderEditButton(`coze.${key}`)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full border-t-2 border-dashed border-gray-200 my-8 relative">
             <span className="absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white px-4 text-gray-400 text-sm font-medium">
               以下为其他通用功能配置
             </span>
          </div>

          {/* B. 通用功能配置 */}
          <div className="space-y-4">
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
               <h5 className="font-bold mb-1 flex items-center gap-2"><Wrench size={16}/> 通用工具箱配置 (Features)</h5>
               在此处配置“AI工具箱”中各个独立小功能的接口。
             </div>
             <div className="grid grid-cols-1 gap-4">
               {Object.entries(config.features || {}).map(([featureName, featureConfig]) => {
                 const isEditing = editingItems[`features.${featureName}`];
                 return (
                   <div key={featureName} className={`bg-white p-4 rounded-lg border transition-all ${isEditing ? 'border-sky-400 ring-1 ring-sky-100 shadow-md' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                     <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                       <div className="md:w-1/4 min-w-[150px]">
                         <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                           <Wrench size={14} className="text-gray-400"/>
                           {featureName}
                         </h4>
                       </div>
                       <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                         <div className="relative">
                            {renderTextInput(featureConfig.apiUrl, (e) => handleFeatureChange(featureName, 'apiUrl', e.target.value), "API URL", isEditing)}
                         </div>
                         <div className="relative">
                            {renderApiKeyInput(featureConfig.apiKey, (e) => handleFeatureChange(featureName, 'apiKey', e.target.value), `features.${featureName}`, isEditing)}
                         </div>
                         <div className="relative">
                            {renderTextInput(featureConfig.modelName, (e) => handleFeatureChange(featureName, 'modelName', e.target.value), "模型名称", isEditing)}
                         </div>
                         {/* 新增：Schema生成地址与任务创建地址等 */}
                         {['网页数据提取工具', 'AI搜索大师3.0', 'AI文案助手', 'AI电商文案助手', 'AI文档编辑器', 'AI PPT制作', 'AI学术论文搜索'].includes(featureName) && (
                             <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {/* 网页数据提取工具 & 搜索大师 (现有逻辑) */}
                                {['网页数据提取工具', 'AI搜索大师3.0'].includes(featureName) && (
                                  <>
                                    {featureName === '网页数据提取工具' && (
                                      <div className="relative md:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1 block">生成Schema接口 (Generate Schema URL)</label>
                                        {renderTextInput(featureConfig.schemaUrl, (e) => handleFeatureChange(featureName, 'schemaUrl', e.target.value), "生成Schema API地址", isEditing)}
                                      </div>
                                    )}
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">创建任务/搜索接口 (Create Task/Search URL)</label>
                                      {renderTextInput(featureConfig.apiUrl, (e) => handleFeatureChange(featureName, 'apiUrl', e.target.value), "API地址", isEditing)}
                                    </div>
                                    {featureName === '网页数据提取工具' && (
                                      <div className="relative">
                                        <label className="text-xs text-gray-500 mb-1 block">查询任务接口 (Result URL)</label>
                                        {renderTextInput(featureConfig.resultUrl, (e) => handleFeatureChange(featureName, 'resultUrl', e.target.value), "查询任务结果 API地址", isEditing)}
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* AI文案助手 & AI电商文案助手 */}
                                {['AI文案助手', 'AI电商文案助手'].includes(featureName) && (
                                  <>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">生成文案接口 (Generate URL)</label>
                                      {renderTextInput(featureConfig.apiUrl, (e) => handleFeatureChange(featureName, 'apiUrl', e.target.value), "生成文案 API地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">工具列表接口 (Tools URL)</label>
                                      {renderTextInput(featureConfig.toolsUrl, (e) => handleFeatureChange(featureName, 'toolsUrl', e.target.value), "获取工具列表 API地址", isEditing)}
                                    </div>
                                  </>
                                )}

                                {/* AI文档编辑器 */}
                                {featureName === 'AI文档编辑器' && (
                                  <>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">生成文章大纲接口 (Outline URL)</label>
                                      {renderTextInput(featureConfig.outlineUrl, (e) => handleFeatureChange(featureName, 'outlineUrl', e.target.value), "生成大纲 API地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">生成文章内容接口 (Generate URL)</label>
                                      {renderTextInput(featureConfig.apiUrl, (e) => handleFeatureChange(featureName, 'apiUrl', e.target.value), "生成内容 API地址", isEditing)}
                                    </div>
                                  </>
                                )}

                                {/* AI PPT制作 */}
                                {featureName === 'AI PPT制作' && (
                                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">生成大纲接口 (Generate Outline)</label>
                                      {renderTextInput(featureConfig.outlineUrl, (e) => handleFeatureChange(featureName, 'outlineUrl', e.target.value), "生成大纲接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">生成大纲内容/PPT接口 (Generate Content)</label>
                                      {renderTextInput(featureConfig.contentUrl, (e) => handleFeatureChange(featureName, 'contentUrl', e.target.value), "生成大纲内容/PPT接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">文件解析接口 (Parse File)</label>
                                      {renderTextInput(featureConfig.parseUrl, (e) => handleFeatureChange(featureName, 'parseUrl', e.target.value), "文件解析接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">查询生成状态接口 (Check Status)</label>
                                      {renderTextInput(featureConfig.statusUrl, (e) => handleFeatureChange(featureName, 'statusUrl', e.target.value), "查询生成状态接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">获取模板选项接口 (Template Options)</label>
                                      {renderTextInput(featureConfig.templateUrl, (e) => handleFeatureChange(featureName, 'templateUrl', e.target.value), "获取模板选项接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">分页查询PPT模板接口 (Get Templates)</label>
                                      {renderTextInput(featureConfig.templatesListUrl, (e) => handleFeatureChange(featureName, 'templatesListUrl', e.target.value), "分页查询PPT模板接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">下载PPT接口 (Download PPT)</label>
                                      {renderTextInput(featureConfig.downloadUrl, (e) => handleFeatureChange(featureName, 'downloadUrl', e.target.value), "下载PPT接口地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">加载PPT数据接口 (Load PPT Data)</label>
                                      {renderTextInput(featureConfig.loadUrl, (e) => handleFeatureChange(featureName, 'loadUrl', e.target.value), "加载PPT数据接口地址", isEditing)}
                                    </div>
                                  </div>
                                )}

                                {/* AI学术论文搜索 */}
                                {featureName === 'AI学术论文搜索' && (
                                  <>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">Arxiv搜索接口 (Arxiv URL)</label>
                                      {renderTextInput(featureConfig.apiUrl, (e) => handleFeatureChange(featureName, 'apiUrl', e.target.value), "Arxiv API地址", isEditing)}
                                    </div>
                                    <div className="relative">
                                      <label className="text-xs text-gray-500 mb-1 block">谷歌学术搜索接口 (Google Scholar URL)</label>
                                      {renderTextInput(featureConfig.googleUrl, (e) => handleFeatureChange(featureName, 'googleUrl', e.target.value), "谷歌学术 API地址", isEditing)}
                                    </div>
                                  </>
                                )}
                             </div>
                         )}
                         {/* 新增：结果查询地址与提示词配置 (通用 - 排除上述特殊配置的功能) */}
                         {!['网页数据提取工具', 'AI搜索大师3.0', 'AI文案助手', 'AI电商文案助手', 'AI文档编辑器', 'AI PPT制作', 'AI学术论文搜索'].includes(featureName) && (
                         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <div className="relative">
                               <label className="text-xs text-gray-500 mb-1 block">结果查询地址 (Result URL)</label>
                               {renderTextInput(featureConfig.resultUrl, (e) => handleFeatureChange(featureName, 'resultUrl', e.target.value), "异步任务结果查询地址", isEditing)}
                            </div>
                            <div className="relative">
                               <label className="text-xs text-gray-500 mb-1 block">预设提示词 (System Prompt)</label>
                               <textarea
                                 value={featureConfig.systemPrompt || ''}
                                 onChange={(e) => handleFeatureChange(featureName, 'systemPrompt', e.target.value)}
                                 disabled={!isEditing}
                                 className={`w-full border rounded-lg shadow-sm py-2 px-3 text-sm transition-colors h-[38px] min-h-[38px] resize-y
                                   ${isEditing 
                                     ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-gray-900' 
                                     : 'border-transparent bg-gray-100 text-gray-600 cursor-not-allowed'
                                   }`}
                                 placeholder="功能专属提示词..."
                               />
                            </div>
                         </div>
                         )}
                       </div>
                     </div>
                     {renderEditButton(`features.${featureName}`)}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      )}

      {/* 2. Coze 智能体配置 - REMOVED (Merged into models) */}

      {/* 4. 页面布局 */}
      {activeTab === 'layout' && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
           <h4 className="font-semibold text-lg mb-4 text-gray-800">前端页面布局控制 (实时同步预览)</h4>
           
           <div className="flex flex-col xl:flex-row gap-8 items-start">
             {/* Left: Desktop Mini Preview Visual Editor */}
             <div className="flex-none w-full xl:w-[720px] bg-gray-900 p-2 rounded-xl shadow-2xl border border-gray-700 relative">
                {/* Browser Window Controls */}
                <div className="h-8 bg-gray-800 rounded-t-lg flex items-center px-4 space-x-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 flex-1 h-5 bg-gray-700 rounded text-[10px] text-gray-400 flex items-center px-2 font-mono truncate">
                    https://ai-digital-human.com
                  </div>
                </div>
                
                <div className="bg-white rounded-b-lg overflow-hidden flex flex-col h-[500px] w-full relative">
                   {/* Navbar (Mock - Always Visible) */}
                   <div className="h-14 border-b border-gray-100 flex items-center px-6 bg-white/90 backdrop-blur sticky top-0 z-20 justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex gap-6">
                        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
                        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
                        <div className="w-16 h-3 bg-gray-100 rounded-full"></div>
                      </div>
                   </div>

                   <div className="flex h-full">
                      {/* Sidebar Preview */}
                      <div className="w-48 bg-gray-900 h-full flex flex-col border-r border-gray-800 overflow-y-auto">
                         <div className="p-3">
                            <div className="w-full h-8 bg-gray-800 rounded mb-4"></div>
                            <div className="space-y-2">
                               {SIDEBAR_CATEGORIES.map((cat, i) => (
                                 <div key={i}>
                                   <div className="px-2 py-1 text-[10px] text-gray-500 font-bold uppercase">{cat.name}</div>
                                   {cat.items.map(item => {
                                      const isHidden = (config.layout.hiddenSidebarItems || []).includes(item);
                                      if (isHidden) return null;
                                      return (
                                         <div key={item} className="h-6 mx-2 bg-gray-800/50 rounded flex items-center px-2 mb-1">
                                            <div className="w-3 h-3 bg-gray-700 rounded-sm mr-2"></div>
                                            <div className="w-16 h-2 bg-gray-700 rounded"></div>
                                         </div>
                                      );
                                   })}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* Main Content Area */}
                      <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200 p-4 space-y-4">
                          {/* Hero Section */}
                          {config.layout.displayHero && (
                            <div className="group relative w-full p-8 rounded-2xl border-2 border-transparent hover:border-red-400 transition-all bg-white shadow-sm min-h-[200px] flex flex-col items-center justify-center text-center overflow-hidden">
                               <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
                               <div className="relative z-10 w-full flex flex-col items-center">
                                  <h5 className="font-bold text-2xl mb-3 text-gray-800">AI Digital Human</h5>
                                  <div className="h-4 w-3/4 max-w-lg rounded-full bg-gray-200 mb-2"></div>
                                  <div className="h-4 w-1/2 max-w-md rounded-full bg-gray-100 mb-6"></div>
                               </div>
                               <button onClick={() => handleLayoutChange('displayHero', false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          )}

                          {/* Tools Grid */}
                          {config.layout.showTools && (
                            <div className="group relative w-full p-6 rounded-2xl border-2 border-transparent hover:border-red-400 transition-all bg-white shadow-sm min-h-[160px]">
                              <div className="flex justify-between items-center mb-6">
                                 <h5 className="font-bold text-lg text-gray-800">AI Tools</h5>
                                 <div className="h-2 w-24 bg-gray-100 rounded"></div>
                              </div>
                              <div className="grid grid-cols-4 gap-4">
                                 {[1,2,3,4].map(i => (
                                    <div key={i} className="aspect-[4/3] rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2">
                                       <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500"></div>
                                    </div>
                                 ))}
                              </div>
                              <button onClick={() => handleLayoutChange('showTools', false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          )}

                          {/* Showcase Section */}
                          {config.layout.showShowcase && (
                            <div className="group relative w-full p-6 rounded-2xl border-2 border-transparent hover:border-red-400 transition-all bg-white shadow-sm min-h-[160px]">
                               <div className="flex justify-between items-center mb-6">
                                  <h5 className="font-bold text-lg text-gray-800">Showcase</h5>
                               </div>
                               <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                  {[1,2].map(i => (
                                      <div key={i} className="flex-none w-1/2 aspect-video rounded-xl bg-gray-100 border border-gray-200"></div>
                                  ))}
                               </div>
                               <button onClick={() => handleLayoutChange('showShowcase', false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          )}

                          {/* Footer */}
                          {config.layout.enableFooter && (
                            <div className="group relative w-full p-6 bg-slate-900 text-slate-400 rounded-xl border-2 border-transparent hover:border-red-400 transition-all mt-4">
                               <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
                               <div className="h-2 w-full bg-slate-800 rounded"></div>
                               <button onClick={() => handleLayoutChange('enableFooter', false)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          )}

                          {/* Add Modules */}
                          {(!config.layout.displayHero || !config.layout.showTools || !config.layout.showShowcase || !config.layout.enableFooter) && (
                             <div className="py-4 text-center">
                                <p className="text-gray-400 text-xs mb-2">-- 恢复模块 --</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                   {!config.layout.displayHero && <button onClick={() => handleLayoutChange('displayHero', true)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-blue-50 text-blue-600">+ Hero</button>}
                                   {!config.layout.showTools && <button onClick={() => handleLayoutChange('showTools', true)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-green-50 text-green-600">+ Tools</button>}
                                   {!config.layout.showShowcase && <button onClick={() => handleLayoutChange('showShowcase', true)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-purple-50 text-purple-600">+ Showcase</button>}
                                   {!config.layout.enableFooter && <button onClick={() => handleLayoutChange('enableFooter', true)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-slate-50 text-slate-600">+ Footer</button>}
                                </div>
                             </div>
                          )}
                      </div>
                   </div>
                </div>
             </div>

             {/* Right: Controls */}
             <div className="flex-1 w-full space-y-6">
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900 p-6 rounded-2xl border border-blue-100 shadow-sm">
                 <h5 className="font-bold text-lg mb-2 flex items-center gap-2"><Monitor size={20} className="text-blue-600"/> 布局控制台</h5>
                 <p className="text-sm opacity-80">左侧预览图支持实时交互。您可以点击红色垃圾桶隐藏模块，或在下方列表中切换侧边栏功能的显示状态。</p>
               </div>
               
               {/* Sidebar Management */}
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                     <h6 className="font-semibold text-gray-700 text-sm flex items-center gap-2"><SidebarIcon size={16}/> 侧边栏功能管理</h6>
                     <span className="text-xs text-gray-400">控制前端侧边栏菜单项的显示/隐藏</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {SIDEBAR_CATEGORIES.map((category, idx) => (
                      <div key={idx} className="border-b border-gray-100 last:border-0">
                        <div className="px-4 py-2 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">{category.name}</div>
                        <div className="px-4 py-2 space-y-2">
                           {category.items.map(item => {
                             const isHidden = (config.layout.hiddenSidebarItems || []).includes(item);
                             return (
                               <div key={item} className="flex items-center justify-between py-1">
                                  <span className={`text-sm ${isHidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item}</span>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                     <input
                                        type="checkbox"
                                        checked={!isHidden}
                                        onChange={() => toggleSidebarItem(item)}
                                        className="sr-only peer"
                                     />
                                     <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                                  </label>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfig;
