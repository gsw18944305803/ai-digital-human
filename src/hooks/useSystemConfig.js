import { useState, useEffect } from 'react';

// 默认配置 - 使用 /api/302 代理路径解决 CORS 问题
export const DEFAULT_CONFIG = {
  models: {
    // 核心基础模型
    chat: {
      name: 'AI对话 (AIChat)',
      provider: 'openai',
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'gpt-4o',
      backups: []
    },
    image: {
      name: 'AI生图 (DALL-E)',
      provider: 'dall-e',
      apiUrl: '/api/302/v1/images/generations',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'dall-e-3',
      backups: []
    },
    sora: {
      name: 'Sora2 视频生成',
      provider: 'openai',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'sora-2',
      submitUrl: 'https://api.302.ai/openai/v1/videos',
      statusUrl: 'https://api.302.ai/openai/v1/videos/{id}',
      contentUrl: 'https://api.302.ai/openai/v1/videos/{id}/content',
      backups: []
    },
    video_pipeline: {
      name: '一站式视频创作',
      provider: 'custom',
      apiUrl: '',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'custom-pipeline-v1',
      backups: []
    },
    data_extraction: {
      name: '多平台数据提取',
      provider: 'coze',
      botId: '7597999195278376960',
      apiToken: 'pat_SSVr01EaY6W2SfSmHC22atB4QQapqW63grmU4FPRbSGzB45zy0WDJCS2Ytnsw8EO',
      backups: []
    }
  },
  
  coze: {},

  // 通用功能配置 (Features)
  features: {
    // --- 图片处理 (统一使用 SeedEdit v30) ---
    '绘画机器人': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30',
        systemPrompt: '你是一个专业的绘画机器人。请根据用户上传的图片和描述，进行富有创意的艺术重绘。保持原图构图，但提升艺术风格和细节质感。',
        backups: [] 
    },
    'AI老照片修复': {
        apiUrl: '/api/302/302/inpaint',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'photo-restoration',
        systemPrompt: '你是一个老照片修复专家。请修复这张图片，去除噪点、划痕、折痕，提升清晰度，还原真实色彩，保持人脸自然，增强面部细节。',
        backups: []
    },
    'AI电商场景图生成': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个电商视觉设计师。请保留画面中的主体商品，将其放置在一个高端、有质感的展示背景中。背景要符合商品调性，光影自然，不要改变商品本身。',
        backups: [] 
    },
    'AI图片工具箱': {
        apiUrl: '/api/302/302/enhance',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'image-enhance',
        systemPrompt: '你是一个全能图片处理助手。请优化这张图片的画质，平衡色彩，去除模糊，使其看起来更加清晰、专业。',
        backups: []
    },
    'AI 图片翻译': {
        apiUrl: '/api/302/302/mt/image',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'qwen-mt-image',
        systemPrompt: '你是一个图片内容翻译专家。请将图片中的文字内容翻译成目标语言（默认为中文/英文互译），并保持原有的文字排版和风格，使其自然融合。',
        backups: []
    },
    '证件照生成': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个专业证件照摄影师。请将人物抠出，替换为标准的纯色背景（如白底、蓝底），对面部进行轻微美颜，调整光线，使其符合标准证件照规范。',
        backups: [] 
    },
    'AI 头像制作': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个头像设计师。请根据原图人物特征，生成一个风格独特的头像（如3D皮克斯风、日漫风或手绘风），突出人物神态，富有艺术感。',
        backups: [] 
    },
    'AI照片说话': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个动态图像生成器。请让照片中的人物表情变得生动，仿佛正在说话或微笑，保持面部特征不变，增加动态感。',
        backups: [] 
    },
    'AI 红包封面生成': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个红包封面设计师。请将图片中的主体融入到喜庆、精美的红色背景中，添加中国传统吉祥纹样，设计成一个完美的红包封面。',
        backups: [] 
    },
    'AI 换衣': {
        apiUrl: '/api/302/302/virtual_tryon',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'virtual-tryon-v2',
        systemPrompt: '你是一个虚拟试衣助手。请保持人物的头部、姿势和背景不变，仅将人物的服装替换为用户描述的款式，确保衣物褶皱和光影真实自然。',
        backups: []
    },
    'AI 矢量图生成': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个矢量插画师。请将这张位图转换为简洁、色彩明快、线条流畅的矢量风格插画（Vector Art），适合用于图标或Logo设计。',
        backups: [] 
    },
    '图片竞技场': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个风格转换器。请基于原图，生成一种截然不同的艺术风格，展现AI绘图的多样性。',
        backups: [] 
    },
    'AI 3D 建模': {
        apiUrl: '/api/302/302/3d/format_convert',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: '3d-converter',
        backups: []
    },
    'AI绘图提示词专家': { 
        apiUrl: '/api/302/doubao/drawing/seededit_v30', 
        resultUrl: '/api/302/doubao/drawing/seededit_v30_result',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'seededit_v30', 
        systemPrompt: '你是一个视觉优化专家。请分析这张图片，并生成一张构图更完美、细节更丰富、光影更惊艳的“优化版”图片，同时保持原图的核心内容。',
        backups: [] 
    },

    // --- 信息处理 ---
    'AI搜索大师3.0': {
        apiUrl: '/api/302/chat/completions',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o',
        searchEnabled: true,
        backups: []
    },
    '网页数据提取工具': { 
        apiUrl: '/api/302/302/crawler/task', 
        schemaUrl: '/api/302/302/crawler/generate-schema', 
        resultUrl: '/api/302/302/crawler/task/{taskId}', 
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'crawler', 
        backups: [] 
    },
    'AI 聊天': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'glm-4.7-flashx',
      backups: []
    },
    'AI翻译大师': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'qwen-plus',
      backups: []
    },
    'AI提示词专家': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'glm-4.7-flashx',
      backups: []
    },

    // --- 工作效率 ---
    'AI文案助手': {
        apiUrl: '/api/302/302/writing/api/v1/generate',
        toolsUrl: '/api/302/302/writing/api/v1/tools',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o-mini',
        backups: []
    },
    'AI电商文案助手': {
        apiUrl: '/api/302/302/writing/api/v1/generate',
        toolsUrl: '/api/302/302/writing/api/v1/tools',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o-mini',
        backups: []
    },
    'AI文档编辑器': {
        apiUrl: '/api/302/302/writing/api/v1/longtext/generate',
        outlineUrl: '/api/302/302/writing/api/v1/outline/generate',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o-mini',
        backups: []
    },
    'AI PPT制作': {
        // 一键生成PPT（直接生成）
        directGenerateUrl: '/api/302/302/ppt/directgeneratepptx',
        // 分步生成
        outlineUrl: '/api/302/302/ppt/generateoutline',
        contentUrl: '/api/302/302/ppt/generatecontent',
        syncPptUrl: '/api/302/302/ppt/generatepptx',
        // 文件解析
        parseUrl: '/api/302/302/ppt/parsefiledata',
        // 异步查询
        statusUrl: '/api/302/302/ppt/asyncpptinfo',
        // 模板相关
        templateUrl: '/api/302/302/ppt/template/options',
        templatesListUrl: '/api/302/302/ppt/templates',
        // 加载和下载
        loadUrl: '/api/302/302/ppt/loadpptx',
        downloadUrl: '/api/302/302/ppt/downloadpptx',
        // API配置
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o',
        backups: []
    },

    // --- 代码相关 ---
    'AI网页生成器': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'gpt-5.2-codex',
      backups: []
    },
    'AI网页生成器2.0': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'gpt-5.2-codex',
      backups: []
    },
    '代码竞技场': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'gpt-5.2-codex',
      backups: []
    },
    '网页一键部署': {
      apiUrl: '/api/302/302/webserve/upload',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'webserve',
      backups: []
    },

    // --- 学术相关 ---
    'AI学术论文搜索': { 
        apiUrl: '/api/302/302/search/academic/arxiv',
        googleUrl: '/api/302/302/search/academic/google',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', 
        modelName: 'academic-search', 
        backups: [] 
    },
    'PDF全能工具箱': {
      apiUrl: '/api/302/302/pdf/parse',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'pdf-parser',
      backups: []
    },
    'AI专利搜索': {
      apiUrl: '/api/302/302/search/patent',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'patent-search',
      backups: []
    },
    'AI论文写作': {
        apiUrl: '/api/302/302/paper/async/chat',
        statusUrl: '/api/302/302/paper/async/status',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'gpt-4o-mini',
        backups: []
    },
    'AI卡片生成': {
        apiUrl: '/api/302/302/card/generate/knowledge_card',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'claude-3-7-sonnet-20250219',
        backups: []
    },
    'AI视频深度翻译': {
        apiUrl: '/api/302/302/video/download',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'video-translator',
        backups: []
    },
    'AI答题机': { apiUrl: '', apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd', modelName: 'gpt-4o-mini', backups: [] },

    // --- 音频相关 ---
    'AI语音生成器': {
        uploadUrl: '/api/302/bigmodel/api/paas/v4/files',
        cloneUrl: '/api/302/bigmodel/api/paas/v4/voice/clone',
        ttsUrl: '/api/302/bigmodel/api/paas/v4/audio/transmissions',
        apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: 'glm-tts-clone',
        backups: []
    },
    'AI 音乐制作': {
      apiUrl: '/api/302/302/audio/generate',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'suno-v3',
      backups: []
    },
    'AI 播客制作': {
      apiUrl: '/api/302/302/podcast/generate',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'podcast-generator',
      backups: []
    },
    'AI 语音通话': {
      apiUrl: '/api/302/chat/completions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'glm-4.7-flashx',
      backups: []
    },
    '语音竞技场': {
      ttsUrl: '/api/302/bigmodel/api/paas/v4/audio/transmissions',
      apiKey: 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
      modelName: 'glm-tts',
      backups: []
    }
  },
  
  layout: {
    displayHero: true,
    showShowcase: true,
    showTools: true,
    themeColor: 'blue',
    enableFooter: true,
    hiddenSidebarItems: ['AI 卡片生成', '模型竞技场', 'AI 画图版', 'AI 财讯助手', 'AI Excel'] 
  }
};

export const useSystemConfig = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfig = () => {
      const saved = localStorage.getItem('system_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig(prev => ({
            ...prev,
            ...parsed,
            models: { ...prev.models, ...(parsed.models || {}) },
            features: { ...prev.features, ...(parsed.features || {}) },
            coze: { ...prev.coze, ...(parsed.coze || {}) },
            layout: { ...prev.layout, ...(parsed.layout || {}) }
          }));
        } catch (e) {
          console.error('Failed to parse system config', e);
        }
      }
    };

    loadConfig();

    const handleUpdate = () => loadConfig();
    window.addEventListener('system_config_updated', handleUpdate);
    return () => window.removeEventListener('system_config_updated', handleUpdate);
  }, []);

  return config;
};
