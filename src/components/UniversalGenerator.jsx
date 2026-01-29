import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Copy, RefreshCw, Settings, FileText, Image as ImageIcon, CheckCircle, Check, ArrowRight, Mic, ChevronDown, Upload, X, ChevronRight } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { writingService } from '../services/writingService';
import PromptOptimizer from './PromptOptimizer';
import { trackActivity } from '../services/userActivityService';

const UniversalGenerator = ({ title }) => {
  const systemConfig = useSystemConfig();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [sourceLang, setSourceLang] = useState('自动识别');
  const [targetLang, setTargetLang] = useState('英文');
  const [selectedStyle, setSelectedStyle] = useState('自动');
  const [modificationText, setModificationText] = useState('');

  // 新增：图片上传和参数选择相关状态
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const fileInputRef = useRef(null);

  // AI文案助手相关状态
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolParams, setToolParams] = useState({});
  const [loadingTools, setLoadingTools] = useState(false);

  const translationStyles = ['自动', '专业', '活泼', '简洁', '文艺'];

  const languages = [
    '中文', '英文', '日语', '韩语', '法语', '德语', '西班牙语', '俄语', '意大利语', '葡萄牙语'
  ];

  // 图片上传处理
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      setUploadedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  // 移除上传的图片
  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 判断当前功能是否需要上传图片
  const needsImageUpload = () => {
    const imageFeatures = ['绘画机器人', 'AI老照片修复', 'AI电商场景图生成', 'AI图片工具箱', 'AI图片翻译', '证件照生成', 'AI头像制作', 'AI照片说话', 'AI红包封面生成', 'AI换衣', 'AI矢量图生成', 'AI 3D建模'];
    return imageFeatures.includes(title);
  };

  // 判断当前功能是否有可选参数
  const hasOptions = () => {
    const featuresWithOptions = {
      '绘画机器人': {
        options: [
          { name: '图片比例', key: 'aspect_ratio', values: ['1:1', '16:9', '4:3', '3:4', '9:16'],
            default: '1:1'
          },
          { name: '风格', key: 'style', values: ['写实', '动漫', '油画', '水彩', '素描', '赛博朋克', '复古'],
            default: '写实'
          },
          { name: '质量', key: 'quality', values: ['标准', '高清', '超清'],
            default: '标准'
          }
        ]
      },
      'AI老照片修复': {
        options: [
          { name: '修复程度', key: 'level', values: ['轻度', '标准', '深度'],
            default: '标准'
          },
          { name: '增强模式', key: 'enhance', values: ['开启', '关闭'],
            default: '开启'
          }
        ]
      },
      'AI换衣': {
        options: [
          { name: '服装类型', key: 'clothing_type', values: ['连衣裙', '衬衫', '裤子', '外套', '套装', '运动服'],
            default: '连衣裙'
          },
          { name: '风格', key: 'style', values: ['休闲', '正式', '时尚', '复古', '运动'],
            default: '时尚'
          }
        ]
      },
      'AI PPT制作': {
        options: [
          { name: '页数', key: 'pages', values: ['5-10页', '10-15页', '15-20页', '20+页'],
            default: '10-15页'
          },
          { name: '风格', key: 'style', values: ['商务', '简约', '创意', '学术', '科技'],
            default: '商务'
          },
          { name: '配色', key: 'color_scheme', values: ['蓝色', '红色', '绿色', '紫色', '橙色'],
            default: '蓝色'
          }
        ]
      }
    };
    return featuresWithOptions[title];
  };

  // 切换选项面板显示
  const toggleOptionsPanel = () => {
    setShowOptionsPanel(!showOptionsPanel);
  };

  // 选择参数选项
  const selectOption = (key, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper to get feature config or default
  const getFeatureConfig = (name) => {
    return systemConfig?.features?.[name] || {};
  };

  const getPageConfig = (pageTitle) => {
    const featureConfig = getFeatureConfig(pageTitle);
    // 优先使用配置中的 Key/URL，如果没有则使用默认（但默认可能是空的）
    const apiKey = featureConfig.apiKey || systemConfig?.models?.chat?.apiKey; // Fallback to chat key if specific key not set? Or empty.
    // 对于特定功能，可能有特定的 fallback 逻辑
    const apiUrl = featureConfig.apiUrl;
    const modelName = featureConfig.modelName || 'gpt-4o-mini';

    if (pageTitle === 'AI翻译大师') {
      return {
        inputLabel: '请输入需要翻译的内容',
        placeholder: '请输入需要翻译的内容',
        btnLabel: '开始翻译',
        systemPrompt: `你是一个专业的翻译助手。翻译风格：${selectedStyle}。请将用户输入的内容准确翻译成${targetLang}。`,
        userContent: (text) => `请将以下${sourceLang === '自动识别' ? '' : sourceLang}内容翻译成${targetLang}：\n${text}`,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI提示词专家') {
      const promptConfig = systemConfig?.models?.prompt || {};
      return {
        inputLabel: '请输入您的创意描述或原始提示词 (Powered by 302.ai)',
        placeholder: '请输入您的创意描述或原始提示词...',
        btnLabel: '生成/优化提示词',
        apiType: 'enhance-sync',
        apiUrl: promptConfig.apiUrl || 'https://api.302.ai/302/prompt/enhance',
        apiKey: promptConfig.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: promptConfig.modelName || 'gpt-4o-mini',
        userContent: (text) => text
      };
    } else if (pageTitle === 'AI搜索大师3.0') {
      return {
        inputLabel: '请输入您的搜索问题',
        placeholder: '请输入您想知道的问题，例如：最新的AI技术发展趋势...',
        btnLabel: '开始搜索',
        apiType: 'chat-with-search',
        systemPrompt: '你是一个全能的AI搜索专家。请使用联网搜索功能来获取最新信息，然后提供全面、准确、有深度的答案。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === '网页数据提取工具') {
      return {
        inputLabel: '请输入需要提取的文本内容',
        placeholder: '请粘贴包含关键数据的文本内容...',
        btnLabel: '提取数据',
        systemPrompt: '你是一个专业的数据提取助手。请分析用户输入的文本内容，提取其中的关键信息（如实体、数值、日期、联系方式等），并以清晰的结构（如列表或JSON格式）输出。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI提示词专家2.0') {
      return {
        inputLabel: '请输入您的创意描述',
        placeholder: '请输入您的创意描述，例如：一只在太空中飞行的猫...',
        btnLabel: '生成高级提示词',
        systemPrompt: '你是一位精通各类AI绘画和文本生成的提示词专家（Prompt Engineer）。请根据用户的描述，生成适用于Midjourney、Stable Diffusion或ChatGPT的高质量提示词。请提供英文提示词，并附带中文说明。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === '模型竞技场') {
      return {
        inputLabel: '请输入您的问题',
        placeholder: '请输入一个具有挑战性的问题，看看AI如何回答...',
        btnLabel: '开始竞技',
        systemPrompt: '你是一个全能的AI助手。请针对用户的问题，提供最详尽、全面、客观的回答。你的回答应该涵盖问题的各个方面，展现出高水平的逻辑推理和知识广度。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI文案助手') {
      return {
        inputLabel: '请输入文案主题或要求',
        placeholder: '请输入文案的主题、受众、风格等要求...',
        btnLabel: '生成文案',
        apiType: 'writing',
        toolsUrl: '/api/302/302/writing/api/v1/tools',
        generateUrl: '/api/302/302/writing/api/v1/generate',
        systemPrompt: '你是一位资深的文案策划专家。请根据用户的主题和要求，撰写出富有创意、吸引眼球且逻辑清晰的文案。请注意根据受众调整语气和风格。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI电商文案助手') {
      return {
        inputLabel: '请输入商品信息和卖点',
        placeholder: '请输入商品名称、功能特点、目标人群等...',
        btnLabel: '生成电商文案',
        systemPrompt: '你是一位精通电商营销的文案专家。请根据商品信息，撰写出高转化率的商品详情页文案、短视频脚本或社交媒体推广文案。重点突出痛点解决和产品优势。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI文档编辑器') {
      return {
        inputLabel: '请输入文档大纲或主要内容',
        placeholder: '请输入文档的主题、章节安排或关键点...',
        btnLabel: '生成文档',
        systemPrompt: '你是一位专业的文档编辑和撰稿人。请根据用户提供的大纲或内容，扩写成一篇结构严谨、内容详实、语言规范的长文档。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI PPT制作') {
      return {
        inputLabel: '请输入演示文稿主题',
        placeholder: '请输入PPT的主题、演讲对象、时长等...',
        btnLabel: '生成PPT大纲',
        systemPrompt: '你是一位专业的演示文稿设计师。请根据用户的主题，生成一份高质量的PPT大纲。包括每一页的标题、核心内容点以及建议的配图或图表描述。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI 网页总结') {
      return {
        inputLabel: '请输入网页链接或文本内容',
        placeholder: '请粘贴需要总结的网页文章内容...',
        btnLabel: '开始总结',
        systemPrompt: '你是一位高效的信息分析师。请阅读用户提供的文本内容，快速提炼出核心观点、关键数据和重要结论，生成一份简洁明了的总结报告。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI 画图版') {
      return {
        inputLabel: '请输入想要绘制的内容描述',
        placeholder: '描述你想画的内容，例如：流程图、思维导图或具体场景...',
        btnLabel: '生成绘图描述',
        systemPrompt: '你是一位视觉思维专家。请根据用户的描述，提供详细的绘图指导，或者生成SVG代码/Mermaid代码来可视化用户的想法。如果用户描述的是场景，请提供详细的画面描述。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI 财讯助手') {
      return {
        inputLabel: '请输入财经问题或资讯',
        placeholder: '请输入你想了解的财经话题、股票或市场动态...',
        btnLabel: '获取财讯解读',
        systemPrompt: '你是一位资深的财经分析师。请根据用户的问题，提供专业的市场分析、投资建议（需声明风险）或财经新闻解读。请使用专业术语但保持通俗易懂。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI Excel') {
      return {
        inputLabel: '请输入数据处理需求',
        placeholder: '描述你想进行的Excel操作，例如：如何计算复利、提取特定数据...',
        btnLabel: '生成Excel公式/代码',
        systemPrompt: '你是一位Excel和数据处理专家。请根据用户的需求，提供准确的Excel公式、VBA代码或Python Pandas代码，并解释其工作原理。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI 简历制作') {
      return {
        inputLabel: '请输入个人经历和求职意向',
        placeholder: '请输入您的教育背景、工作经历、技能以及想申请的职位...',
        btnLabel: '优化/生成简历',
        systemPrompt: '你是一位资深的人力资源专家和职业规划师。请根据用户的经历，优化其简历内容，使其更具竞争力。请使用STAR法则描述工作经历，并针对求职意向突出重点。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI 小说写作') {
      return {
        inputLabel: '请输入小说灵感或大纲',
        placeholder: '请输入故事背景、主要角色、情节走向...',
        btnLabel: '开始创作',
        systemPrompt: '你是一位充满创意的畅销书作家。请根据用户的灵感，续写故事、丰富情节或刻画人物。请注意保持故事的连贯性和文学性，风格要符合用户设定的类型。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI学术论文搜索') {
      return {
        inputLabel: '请输入研究主题或关键词',
        placeholder: '请输入您想研究的领域、关键词或具体问题...',
        btnLabel: '搜索论文',
        systemPrompt: '你是一位资深的学术研究助理。请根据用户的主题，模拟学术搜索的过程，推荐相关的经典论文和最新研究成果。请列出论文标题、作者、年份和简要摘要，并总结该领域的研究现状。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'PDF全能工具箱') {
      return {
        inputLabel: '请输入文本内容或操作需求',
        placeholder: '请粘贴需要处理的文本，或者询问如何进行PDF合并、拆分等操作...',
        btnLabel: '处理/咨询',
        systemPrompt: '你是一位PDF处理和文档管理专家。如果用户提供文本，请帮其格式化为适合PDF文档的样式（如添加标题、段落排版）。如果用户询问工具使用，请提供详细的操作指南（如Adobe Acrobat、在线工具的使用方法）。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI专利搜索') {
      return {
        inputLabel: '请输入技术关键词或发明描述',
        placeholder: '请输入发明的技术领域、核心创新点或关键词...',
        btnLabel: '检索专利',
        systemPrompt: '你是一位专业的专利代理人和检索专家。请根据用户的描述，模拟专利检索，提供可能相关的现有技术（Prior Art）。请分析技术的可专利性，并列出相关的专利分类号（IPC/CPC）建议。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI论文写作') {
      return {
        inputLabel: '请输入论文题目、大纲或段落',
        placeholder: '请输入论文的主题、想要扩写的观点或需要润色的段落...',
        btnLabel: '写作/润色',
        systemPrompt: '你是一位学术写作导师。请帮助用户撰写或润色学术论文。你可以帮助生成大纲、扩写摘要、优化语言表达（Academic English）、检查逻辑结构或生成参考文献格式。保持严谨的学术语调。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI答题机') {
      return {
        inputLabel: '请输入题目内容',
        placeholder: '请粘贴题目内容，支持数学、物理、编程等各类学科...',
        btnLabel: '获取解答',
        systemPrompt: '你是一位全能的金牌辅导老师。请详细解答用户提供的题目。不仅要给出正确答案，还要分步骤解释解题思路、涉及的知识点和计算过程。对于文科题目，请提供深入的解析。',
        userContent: (text) => text,
        apiKey, apiUrl, modelName
      };
    } else if (pageTitle === 'AI语音生成器') {
      const ttsConfig = systemConfig?.models?.tts || {};
      return {
        inputLabel: '请输入需要朗读的文本',
        placeholder: '请输入您想转换为语音的文本内容...',
        btnLabel: '生成语音',
        apiType: 'tts',
        apiUrl: ttsConfig.apiUrl || 'https://api.302.ai/v1/audio/speech',
        apiKey: ttsConfig.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd',
        modelName: ttsConfig.modelName || 'tts-1',
        userContent: (text) => text
      };
    }
    return {
      inputLabel: '输入需求',
      placeholder: `请输入${pageTitle}相关的具体描述或要求...`,
      btnLabel: '开始生成',
      systemPrompt: `你是一个智能助手。当前功能是"${pageTitle}"。请根据用户输入执行相应任务。`,
      userContent: (text) => text,
      apiKey, apiUrl, modelName
    };
  };

  const config = getPageConfig(title);

  // 加载AI文案助手工具列表
  useEffect(() => {
    if (title === 'AI文案助手' && config.toolsUrl && config.apiKey) {
      const loadTools = async () => {
        setLoadingTools(true);
        try {
          const toolsList = await writingService.getTools(config.apiKey, config.toolsUrl);
          setTools(toolsList);
          if (toolsList.length > 0) {
            setSelectedTool(toolsList[0]);
          }
        } catch (e) {
          console.error('Failed to load tools:', e);
        } finally {
          setLoadingTools(false);
        }
      };
      loadTools();
    }
  }, [title, config.toolsUrl, config.apiKey]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setResult(null);

    // 检查 Key
    if (!config.apiKey && config.apiType !== 'async-task' && config.apiType !== 'enhance-sync' && config.apiType !== 'tts' && config.apiType !== 'search' && config.apiType !== 'chat-with-search') {
        // 如果是普通对话类且没有Key，尝试使用默认 Chat Key
        // 如果还是没有，提示错误
        if (!systemConfig?.models?.chat?.apiKey) {
           setResult('错误: 未配置 API Key。请联系管理员在系统配置中设置。');
           setIsGenerating(false);
           return;
        }
    }
    const effectiveApiKey = config.apiKey || systemConfig?.models?.chat?.apiKey;
    const effectiveApiUrl = config.apiUrl || systemConfig?.models?.chat?.apiUrl || 'https://api.302.ai/chat/completions';
    const effectiveModel = config.modelName || 'gpt-4o-mini';

    try {
      if (config.apiType === 'tts') {

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: inputText.trim(),
            voice: 'alloy',
            response_format: 'mp3',
            speed: 1.0
          }),
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();
          // 检查是否返回了音频 URL (针对 302.ai 可能的 JSON 响应格式)
          if (jsonResponse.url) {
            setResult(jsonResponse.url);
            return;
          }
          // 检查是否返回了 output 字段包含 url (某些异步接口格式)
          if (jsonResponse.output && jsonResponse.output.url) {
             setResult(jsonResponse.output.url);
             return;
          }
          
          console.error('TTS API Error:', jsonResponse);
          throw new Error(jsonResponse.error?.message || jsonResponse.message || JSON.stringify(jsonResponse));
        }

        if (!response.ok) {
          throw new Error(`生成失败 (${response.status})`);
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('生成的音频内容为空');
        }
        const audioUrl = URL.createObjectURL(blob);
        setResult(audioUrl);
      } else if (config.apiType === 'search') {
        // 搜索 API 处理 - 302.ai advanced_search (仅支持流式模式)
        console.log('🔍 [搜索API] 请求URL:', effectiveApiUrl);
        console.log('🔍 [搜索API] 请求参数:', { query: inputText.trim() });

        // 设置初始结果显示
        setResult('');

        const response = await fetch(effectiveApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify({
            query: inputText.trim()
          }),
        });

        console.log('🔍 [搜索API] 响应状态:', response.status);

        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           console.error('❌ [搜索API] 错误响应:', errData);
           throw new Error(errData.msg || errData.message || errData.error || `搜索请求失败 (${response.status})`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log('📦 [搜索API] 接收数据块:', chunk);

          // 解析 SSE 格式数据 (data: {...})
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;

              try {
                const data = JSON.parse(jsonStr);
                // 提取内容 - 可能的字段: content, answer, text, delta, choices[0].delta.content
                const content = data.content || data.answer || data.text ||
                                data.delta?.content ||
                                data.choices?.[0]?.delta?.content ||
                                data.data || '';

                if (content) {
                  fullText += content;
                  setResult(fullText); // 实时更新显示
                }
              } catch (e) {
                console.warn('解析SSE数据失败:', jsonStr, e);
              }
            }
          }
        }

        if (!fullText) {
          setResult('未获取到搜索结果，请稍后重试');
        }

      } else if (config.apiType === 'enhance-sync') {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            id: 2, // Default to CO-STAR method
            prompt: inputText.trim(),
            model: 'gpt-4o-mini',
            stream: false
          }),
        });

        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           console.error('Enhance API Error:', errData);
           throw new Error(errData.msg || errData.message || `请求失败 (${response.status})`);
        }

        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.content) {
            setResult(data.data.content);
        } else {
            throw new Error(data.msg || '未获取到有效内容');
        }

      } else if (config.apiType === 'async-task') {
        // 1. Submit Task
        const submitResponse = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
          },
          // 302.ai Prompt Expert API Payload
          // Construct the payload with required fields: prompt, model, qa, max_rounds
          body: JSON.stringify({
            prompt: inputText.trim(),
            model: 'co-star', // Default model/style
            qa: [{ question: '', answer: '' }], // Required dummy QA pair to satisfy API validation
            max_rounds: 1
          }),
        });

        if (!submitResponse.ok) {
           const errData = await submitResponse.json().catch(() => ({}));
           console.error('Task Submit Error:', errData);
           throw new Error(errData.msg || errData.message || (errData.detail ? JSON.stringify(errData.detail) : '') || `提交任务失败 (${submitResponse.status})`);
        }

        const submitData = await submitResponse.json();
        // 302.ai usually returns 'id' or 'task_id'
        const taskId = submitData.id || submitData.task_id; 

        if (!taskId) {
            throw new Error('未获取到任务ID');
        }

        // 2. Poll for Result
        let taskResult = null;
        let attempts = 0;
        const maxAttempts = 30; // ~60s timeout
        
        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000)); 

            const checkUrl = config.resultUrl.replace('{task_id}', taskId);
            const checkResponse = await fetch(checkUrl, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                }
            });

            if (!checkResponse.ok) continue;

            const checkData = await checkResponse.json();
            
            // Check status (flexible check for common states)
            const status = checkData.status; // 'processing', 'succeeded', 'failed'
            
            if (status === 'succeeded' || status === 'success') {
                // Try to extract the optimized prompt content
                // It might be in checkData.output.prompt, checkData.output, or checkData.result
                if (checkData.output && typeof checkData.output === 'object') {
                    taskResult = checkData.output.prompt || checkData.output.result || JSON.stringify(checkData.output, null, 2);
                } else {
                    taskResult = checkData.output || checkData.result || JSON.stringify(checkData, null, 2);
                }
                break;
            } else if (status === 'failed') {
                throw new Error(checkData.error || checkData.msg || '任务执行失败');
            }
            // If processing, continue polling
        }

        if (taskResult) {
            setResult(taskResult);
        } else {
            throw new Error('任务处理超时，请稍后重试');
        }

      } else if (config.apiType === 'writing') {
        // AI文案助手 - 使用302.ai Writing API
        if (!selectedTool) {
          throw new Error('请先选择一个文案工具');
        }

        // 根据工具参数构建请求
        const params = {};
        const toolParamKeys = Object.keys(selectedTool.params || {});

        // 对于简单的工具，直接使用输入文本作为主要参数
        if (toolParamKeys.includes('topic')) {
          params.topic = inputText.trim();
        } else if (toolParamKeys.includes('prompt')) {
          params.prompt = inputText.trim();
        } else if (toolParamKeys.includes('content')) {
          params.content = inputText.trim();
        } else if (toolParamKeys.includes('text')) {
          params.text = inputText.trim();
        } else {
          // 如果有第一个参数，就使用它
          const firstParam = toolParamKeys[0];
          if (firstParam && firstParam !== 'model' && firstParam !== 'language') {
            params[firstParam] = inputText.trim();
          }
        }

        // 添加语言参数
        if (toolParamKeys.includes('language')) {
          params.language = 'Chinese';
        }

        console.log('📝 [Writing API] 请求参数:', { tool_name: selectedTool.tool_name, model: effectiveModel, params });

        const data = await writingService.generate(
          config.apiKey,
          config.generateUrl,
          selectedTool.tool_name,
          effectiveModel,
          params
        );

        console.log('📝 [Writing API] 响应:', data);

        if (data.status === 'success' && data.result) {
          setResult(data.result);
        } else {
          throw new Error(data.message || '生成文案失败');
        }

      } else {
        // Chat API 处理（包括普通对话和联网搜索）
        const requestBody = {
          model: effectiveModel,
          messages: [
            {
              role: 'system',
              content: config.systemPrompt
            },
            {
              role: 'user',
              content: config.userContent(inputText.trim())
            }
          ]
        };

        // 如果启用联网搜索，添加 search 参数
        if (config.apiType === 'chat-with-search') {
          requestBody.search = {
            enable: true,
            search_result: true
          };
          console.log('🔍 [联网搜索] 已启用');
        }

        const response = await fetch(effectiveApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || '生成失败，请稍后重试');
        }

        const generatedText = data.choices?.[0]?.message?.content;
        if (!generatedText) {
          throw new Error('接口未返回有效内容');
        }

        setResult(generatedText);

        // 记录用户活动
        trackActivity(title, 'generate', {
          inputLength: inputText.length,
          outputLength: generatedText.length,
          model: effectiveModel
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setResult(`生成出错: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (title === 'AI提示词专家') {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Top Input Area */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 relative">
             <input 
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               className="w-full bg-ai-card border border-white/10 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
               placeholder="请输入您的任务,例如:写一篇宣传AI的小红书"
               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
             />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? '生成中...' : '生成'}
          </button>
        </div>
  

  
        {/* Main Result Area */}
        <div className="bg-[#1F2937] rounded-xl min-h-[500px] border border-white/5 p-6 relative shadow-inner">
           {result ? (
             <div className="text-gray-200 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-300">
               {result}
             </div>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {/* Empty State */}
             </div>
           )}
        </div>
  
        {/* Bottom Controls */}
        <div className="flex items-center gap-4">
           <button className="bg-[#6B7280] hover:bg-[#4B5563] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-gray-900/20 font-medium">
              回退
           </button>
           
           <div className="flex-1">
            <input 
              type="text"
              value={modificationText}
              onChange={(e) => setModificationText(e.target.value)}
              className="w-full bg-ai-card border border-white/10 rounded-lg py-2.5 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              placeholder="请提出需要修改的点"
            />
          </div>
  
           <button 
             onClick={() => handleGenerate()}
             className="bg-[#C084FC] hover:bg-[#A855F7] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-purple-900/20 font-medium"
           >
              修改
           </button>
           
           <button 
             onClick={() => {
                navigator.clipboard.writeText(result || '');
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
             }}
             className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-green-900/20 font-medium"
           >
              {isCopied ? '已复制' : '复制'}
           </button>
           
           <button className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20 font-medium">
              测试
           </button>
        </div>
      </div>
    );
  }

  if (title === 'AI翻译大师') {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 border border-white/10 shadow-xl">
               <Sparkles size={24} />
             </div>
             <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{title}</h2>
          </div>
        </div>

        <div className="bg-ai-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Controls */}
          <div className="border-b border-white/5 bg-white/[0.02]">
             {/* Language Selector Row */}
             <div className="flex items-center justify-center p-4 gap-8">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-transparent text-lg font-medium text-gray-200 outline-none cursor-pointer hover:text-white transition-colors [&>option]:bg-gray-800 py-2 px-4 rounded-lg hover:bg-white/5"
                >
                  <option value="自动识别">自动识别</option>
                  {languages.map(lang => (
                    <option key={`source-${lang}`} value={lang}>{lang}</option>
                  ))}
                </select>
                
                <button 
                  onClick={() => {
                     if (sourceLang !== '自动识别') {
                        const temp = sourceLang;
                        setSourceLang(targetLang);
                        setTargetLang(temp);
                     }
                  }}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                >
                   <ArrowRight size={20} />
                </button>

                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-transparent text-lg font-medium text-gray-200 outline-none cursor-pointer hover:text-white transition-colors [&>option]:bg-gray-800 py-2 px-4 rounded-lg hover:bg-white/5"
                >
                  {languages.map(lang => (
                    <option key={`target-${lang}`} value={lang}>{lang}</option>
                  ))}
                </select>
             </div>
             
             {/* Styles Row */}
             <div className="flex items-center px-6 pb-4 gap-3 overflow-x-auto no-scrollbar">
               <span className="text-sm font-medium text-gray-300 shrink-0">翻译要求:</span>
               <button className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors shrink-0">
                  <span className="text-lg leading-none mb-0.5">+</span>
               </button>
               {translationStyles.map(style => (
                  <button 
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
                      selectedStyle === style
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {style}
                  </button>
               ))}
               <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-300 transition-colors shrink-0 ml-auto">
                  <Settings size={18}/>
               </button>
             </div>
          </div>

          {/* Main Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] divide-y md:divide-y-0 md:divide-x divide-white/20">
             {/* Input Side */}
             <div className="p-6 flex flex-col relative group">
                {/* 提示词优化按钮 - 翻译场景 */}
                <div className="absolute top-6 right-6 z-10">
                  <PromptOptimizer
                    value={inputText}
                    onOptimized={setInputText}
                    featureKey="AI提示词专家"
                    featureContext="当前使用AI翻译大师功能，用户需要翻译文本内容。优化时保持原文意思不变，仅优化表达使其更准确、通顺。"
                    buttonClassName="text-xs px-2 py-1"
                  />
                </div>
                <textarea
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   className="w-full flex-1 bg-transparent border-none outline-none resize-none text-lg text-gray-200 placeholder-gray-500/50 leading-relaxed pr-24"
                   placeholder="请输入..."
                />
                
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5 opacity-100 transition-opacity">
                   <div className="text-xs text-gray-600 font-medium">
                      {inputText.length > 0 && `${inputText.length} 字符`}
                   </div>
                   <div className="flex gap-3">
                      <button className="px-4 py-2 rounded-xl border border-purple-500/20 text-purple-300/80 text-sm hover:bg-purple-500/10 hover:text-purple-300 transition-colors">
                        检测语言
                      </button>
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !inputText.trim()}
                        className={`px-6 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg ${
                           isGenerating || !inputText.trim()
                              ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02]'
                        }`}
                      >
                        {isGenerating ? (
                           <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>翻译中</span>
                           </>
                        ) : (
                           <>
                              <span>翻译</span>
                              <span className="border-l border-white/20 pl-2 ml-1 opacity-60">▼</span>
                           </>
                        )}
                      </button>
                   </div>
                </div>
             </div>

             {/* Output Side */}
             <div className="p-6 bg-ai-dark/30 flex flex-col relative">
                {result ? (
                  <>
                     <div className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap flex-1 animate-in fade-in duration-300">
                        {result}
                     </div>
                     <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-white/5">
                        <button 
                           onClick={() => {
                              navigator.clipboard.writeText(result);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                           }}
                           className="p-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                           title="复制"
                        >
                           {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                     </div>
                  </>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                         <Sparkles size={32} className="opacity-20" />
                      </div>
                   </div> 
                )}
             </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="text-sm font-medium">{config.inputLabel}</div>
              </div>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                清空
              </button>
            </div>
            
            {title === 'AI翻译大师' && (
              <div className="flex items-center gap-3 bg-ai-dark/40 p-2 rounded-xl border border-white/5">
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-300 outline-none cursor-pointer hover:text-white transition-colors [&>option]:bg-gray-800"
                >
                  <option value="自动识别">自动识别</option>
                  {languages.map(lang => (
                    <option key={`source-${lang}`} value={lang}>{lang}</option>
                  ))}
                </select>
                <ArrowRight size={14} className="text-gray-400" />
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-300 outline-none cursor-pointer hover:text-white transition-colors text-right [&>option]:bg-gray-800"
                >
                  {languages.map(lang => (
                    <option key={`target-${lang}`} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}

            {title === 'AI文案助手' && (
              <div className="space-y-3">
                {loadingTools ? (
                  <div className="bg-ai-dark/40 p-3 rounded-xl border border-white/5 text-center text-sm text-gray-400">
                    加载工具中...
                  </div>
                ) : (
                  <div className="bg-ai-dark/40 p-3 rounded-xl border border-white/5">
                    <div className="text-xs text-gray-500 mb-2">选择文案类型</div>
                    <select
                      value={selectedTool?.tool_name || ''}
                      onChange={(e) => {
                        const tool = tools.find(t => t.tool_name === e.target.value);
                        setSelectedTool(tool);
                      }}
                      className="w-full bg-transparent text-sm text-gray-300 outline-none cursor-pointer hover:text-white transition-colors [&>option]:bg-gray-800"
                    >
                      {tools.map(tool => (
                        <option key={tool.tool_name} value={tool.tool_name}>
                          {tool.tool_name} - {tool.tool_description}
                        </option>
                      ))}
                    </select>
                    {selectedTool && (
                      <div className="mt-2 text-xs text-gray-500">
                        参数: {Object.keys(selectedTool.params || {}).filter(k => k !== 'model' && k !== 'language').join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 图片上传区域 */}
            {needsImageUpload() && (
              <div className="mb-4">
                <div className="bg-ai-dark/40 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-300 font-medium">📷 上传图片</span>
                    {uploadedImage && (
                      <button
                        onClick={removeUploadedImage}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <X size={14} /> 移除
                      </button>
                    )}
                  </div>

                  {!uploadedImage ? (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload size={32} className="mx-auto mb-2 text-blue-400" />
                        <p className="text-sm text-gray-400">点击或拖拽上传图片</p>
                        <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、WEBP，最大 10MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img src={uploadedImage} alt="上传的图片" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 truncate">{uploadedFile?.name}</p>
                        <p className="text-xs text-gray-500">图片已就绪</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 参数选择面板 */}
            {hasOptions() && (
              <div className="mb-4">
                <button
                  onClick={toggleOptionsPanel}
                  className={`w-full bg-ai-dark/40 border ${showOptionsPanel ? 'border-blue-500/50' : 'border-white/5'} rounded-xl p-3 text-left transition-all hover:border-blue-500/30`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings size={16} className="text-blue-400" />
                      <span className="text-sm text-gray-300 font-medium">⚙️ 参数设置</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 transition-transform ${showOptionsPanel ? 'rotate-90' : ''}`}
                    />
                  </div>

                  {showOptionsPanel && hasOptions()?.options && (
                    <div className="mt-4 space-y-4">
                      {hasOptions().options.map((option) => (
                        <div key={option.key} className="space-y-2">
                          <label className="text-xs text-gray-400">{option.name}</label>
                          <div className="flex flex-wrap gap-2">
                            {option.values.map((value) => (
                              <button
                                key={value}
                                onClick={() => selectOption(option.key, value)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                  selectedOptions[option.key] === value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            )}

            <div className="relative">
              {/* 提示词优化按钮 */}
              <div className="absolute top-2 right-2 z-10">
                <PromptOptimizer
                  value={inputText}
                  onOptimized={setInputText}
                  featureKey="AI提示词专家"
                  featureContext={`当前使用${title}功能，${config.inputLabel}`}
                  buttonClassName="text-xs px-2 py-1"
                />
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 bg-ai-card border border-white/10 rounded-xl p-4 pr-24 text-sm text-gray-100 placeholder-gray-400 outline-none resize-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder={config.placeholder}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {inputText.length} 字
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                isGenerating || !inputText.trim()
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
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
                  <span>{config.btnLabel}</span>
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
              <div className="flex gap-2">
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    result
                      ? 'hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
                  title={isCopied ? "已复制" : "复制"}
                  onClick={() => {
                    if (result) {
                      navigator.clipboard.writeText(result);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }
                  }}
                  disabled={!result}
                >
                  {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
                {result && (
                  <button 
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors" 
                    title="重新生成"
                    onClick={handleGenerate}
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
              </div>
            </div>

            {result ? (
              config.apiType === 'tts' ? (
                <div className="flex-1 bg-ai-dark/40 rounded-xl border border-white/5 p-6 flex items-center justify-center animate-in fade-in duration-500">
                  <div className="w-full max-w-md bg-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                        <Mic size={32} className="text-blue-400" />
                      </div>
                    </div>
                    <audio controls src={result} className="w-full" autoPlay />
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-ai-card rounded-xl border border-white/10 p-6 animate-in fade-in duration-500">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-100 leading-relaxed">
                    {result}
                  </pre>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-ai-dark/20 rounded-xl border border-dashed border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Sparkles size={32} />
                </div>
                <p className="text-sm text-gray-300">结果将在此处展示</p>
                <p className="text-xs text-gray-400 mt-2">请在左侧输入内容并点击生成</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default UniversalGenerator;
