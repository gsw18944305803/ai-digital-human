import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Sparkles, Calendar, Loader2, TrendingUp, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { trackActivity, shouldGenerateDailySummary, getActivitySummaryForAnalysis, saveUserProfile, getUserProfile } from '../services/userActivityService';
import { generateUserProfile, generateDailySummary } from '../services/userProfileService';

const AICompanion = () => {
  const navigate = useNavigate();
  const config = useSystemConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showSummaryNotification, setShowSummaryNotification] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [dailySummary, setDailySummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [suggestedFeature, setSuggestedFeature] = useState(null);
  // 默认位置：在工具网格上方（AI生图上方）
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);

  const chatModel = config?.models?.chat || {};

  // 初始化：检查每日总结和用户画像，计算默认位置
  useEffect(() => {
    // 加载用户画像
    const profile = getUserProfile();
    setUserProfile(profile);

    // 加载保存的位置，如果没有则计算默认位置（AI生图左上方）
    const savedPosition = localStorage.getItem('ai_companion_position');
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (e) {
        console.error('加载位置失败:', e);
        calculateDefaultPosition();
      }
    } else {
      calculateDefaultPosition();
    }

    // 检查是否需要生成每日总结
    if (shouldGenerateDailySummary()) {
      const timer = setTimeout(() => {
        setShowSummaryNotification(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // 每次上线时询问用户今天的任务
    const lastGreeting = localStorage.getItem('ai_companion_last_greeting');
    const today = new Date().toDateString();

    if (lastGreeting !== today) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        localStorage.setItem('ai_companion_last_greeting', today);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 计算默认位置：AI生图左上方
  const calculateDefaultPosition = () => {
    // 延迟执行，确保 DOM 已渲染
    setTimeout(() => {
      const aiImageElement = document.getElementById('ai-image-tool');
      if (aiImageElement) {
        const rect = aiImageElement.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // 定位到 AI生图 左上方
        setPosition({
          x: rect.left + scrollX - 70, // 左侧 70px
          y: rect.top + scrollY - 20   // 上方 20px
        });
      } else {
        // 如果找不到元素，使用默认位置
        setPosition({
          x: 280,
          y: 600
        });
      }
    }, 100);
  };

  // 保存位置到 localStorage
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('ai_companion_position', JSON.stringify(position));
    }
  }, [position]);

  // 拖拽开始 - 只在展开状态的头部触发
  const handleDragStart = (e) => {
    // 只允许通过头部的拖拽图标区域拖拽
    if (!e.target.closest('.drag-handle')) return;

    e.preventDefault();
    setIsDragging(true);

    const rect = widgetRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // 拖拽事件监听 - 使用 useRef 存储以避免闭包问题
  const dragMoveHandlerRef = useRef(null);
  const dragEndHandlerRef = useRef(null);

  useEffect(() => {
    // 拖拽移动处理
    dragMoveHandlerRef.current = (e) => {
      if (!isDragging || !widgetRef.current) return;

      requestAnimationFrame(() => {
        const x = e.clientX - dragOffsetRef.current.x;
        const y = e.clientY - dragOffsetRef.current.y;

        // 限制在窗口范围内
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - (isMinimized ? 56 : 500);

        setPosition({
          x: Math.max(0, Math.min(x, maxX)),
          y: Math.max(0, Math.min(y, maxY))
        });
      });
    };

    // 拖拽结束处理
    dragEndHandlerRef.current = () => {
      setIsDragging(false);
    };
  }, [isDragging, isMinimized]);

  // 注册拖拽事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', dragMoveHandlerRef.current);
      window.addEventListener('mouseup', dragEndHandlerRef.current);

      return () => {
        window.removeEventListener('mousemove', dragMoveHandlerRef.current);
        window.removeEventListener('mouseup', dragEndHandlerRef.current);
      };
    }
  }, [isDragging]);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // 生成每日总结
  const handleGenerateDailySummary = async () => {
    setIsGeneratingSummary(true);
    setShowSummaryNotification(false);

    try {
      const activitySummary = getActivitySummaryForAnalysis(7); // 获取7天数据
      const chatConfig = chatModel;

      // 如果有足够数据，先生成/更新用户画像
      if (activitySummary.totalActivities >= 5) {
        const newProfile = await generateUserProfile(
          activitySummary,
          chatConfig.apiKey,
          chatConfig.apiUrl
        );
        saveUserProfile(newProfile);
        setUserProfile(newProfile);
      }

      // 生成每日总结
      const summary = await generateDailySummary(
        activitySummary,
        userProfile,
        chatConfig.apiKey,
        chatConfig.apiUrl
      );

      setDailySummary(summary);
      setShowSummaryModal(true);

      // 记录总结已生成
      trackActivity('AI伴随助手', 'daily_summary_generated', {
        activitiesCount: activitySummary.totalActivities,
        hasProfile: !!userProfile
      });
    } catch (error) {
      console.error('生成每日总结失败:', error);
      alert('生成总结失败，请稍后再试');
      setShowSummaryNotification(false);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setSuggestedFeature(null); // 清除之前的建议
    setIsTyping(true);

    // 记录用户活动
    trackActivity('AI伴随助手', 'chat_message', { messageLength: userMessage.length });

    try {
      // 调用大模型
      const response = await fetch('/api/302/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chatModel.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd'}`
        },
        body: JSON.stringify({
          model: chatModel.modelName || 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `你是AI数字员工的智能助手。你的任务是帮助用户找到需要的功能。

网站完整功能列表：
【图片处理】绘画机器人、AI老照片修复、AI电商场景图生成、AI图片工具箱、AI图片翻译、证件照生成、AI头像制作、AI照片说话、AI红包封面生成、AI换衣、AI矢量图生成、图片竞技场、AI 3D建模、AI绘图提示词专家
【信息处理】AI聊天、AI翻译大师、AI提示词专家、AI搜索大师3.0、网页数据提取工具
【工作效率】AI文案助手、AI电商文案助手、AI文档编辑器、AI PPT制作
【代码相关】AI网页生成器、AI网页生成器2.0、代码竞技场、网页一键部署
【学术相关】AI学术论文搜索、PDF全能工具箱、AI专利搜索、AI论文写作、AI答题机
【音频相关】AI语音生成器、AI音乐制作、AI播客制作、AI语音通话、语音竞技场
【视频相关】AI生图、Sora2 视频生成、Veo3.1 视频生成、Sora2 故事板、一站式视频创作流水线、多平台视频数据一键提取、宣传海报视频制作
【其他】AI生图、AI卡片生成、营销场景图生成

回复规则：
1. 简洁友好地回复，不超过60字
2. 如果用户明确提到某个功能需求（如翻译、写文案、做PPT、生成图片、视频制作、语音合成、论文写作、代码生成、搜索等），在回复末尾用【功能：功能名】的格式标注推荐的功能
3. 功能名必须完全匹配上述列表中的名称
4. 例如："我来帮您翻译。【功能：AI翻译大师】"或"我可以帮您生成图片。【功能：绘画机器人】"`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        let assistantMessage = data.choices?.[0]?.message?.content || '抱歉，我现在无法回答这个问题。';

        // 解析AI推荐的功能
        const featureMatch = assistantMessage.match(/【功能：(.*?)】/);
        if (featureMatch) {
          const featureName = featureMatch[1];
          setSuggestedFeature(featureName);
          // 从回复中移除功能标记
          assistantMessage = assistantMessage.replace(/【功能：.*?】/, '').trim();
        }

        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      } else {
        const errorText = await response.text();
        console.error('API错误:', errorText);
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后再试。' }]);
      }
    } catch (error) {
      console.error('AI伴随错误:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，网络连接出现问题，请检查网络后重试。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action) => {
    let prompt = '';
    switch (action) {
      case 'tasks':
        prompt = '我今天有什么任务安排吗？请帮我规划一下。';
        break;
      case 'find':
        prompt = '我想使用功能，但不知道选哪个，你能帮我推荐吗？';
        break;
      case 'optimize':
        prompt = '我有一个提示词需要优化，你能帮我优化吗？';
        break;
      case 'help':
        prompt = '这个网站怎么使用？';
        break;
      default:
        return;
    }

    if (prompt) {
      // 直接发送消息
      setInputValue('');
      setMessages(prev => [...prev, { role: 'user', content: prompt }]);
      setConversationHistory(prev => [...prev, { role: 'user', content: prompt }]);
      setIsTyping(true);

      // 记录用户活动
      trackActivity('AI伴随助手', 'chat_message', { messageLength: prompt.length, type: 'quick_action' });

      try {
        // 调用API
        const response = await fetch('/api/302/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${chatModel.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd'}`
          },
          body: JSON.stringify({
            model: chatModel.modelName || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: '你是AI数字员工的智能伴随助手。简洁友好地回复，最多80字。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 300,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMessage = data.choices?.[0]?.message?.content || '抱歉，我现在无法回答这个问题。';
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
          setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } else {
          throw new Error('API请求失败');
        }
      } catch (error) {
        console.error('AI伴随错误:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我遇到了一些问题，请稍后再试。' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleQuickFeature = (featureName) => {
    // 直接跳转到对应功能页面
    navigate(`/backend?title=${encodeURIComponent(featureName)}`);
  };

  return (
    <div className="fixed z-50 font-sans">
      {/* 每日总结通知 */}
      {showSummaryNotification && (
        <div className="fixed bottom-24 right-6 w-80 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-amber-700 p-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-xl">
              <Calendar size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 dark:text-white mb-1">每日总结准备好了</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                我已经分析了您最近的使用情况，要不要看看总结？
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateDailySummary}
                  disabled={isGeneratingSummary}
                  className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isGeneratingSummary ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                  {isGeneratingSummary ? '生成中...' : '查看总结'}
                </button>
                <button
                  onClick={() => setShowSummaryNotification(false)}
                  className="px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  稍后
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 每日总结模态框 */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl">
                  <Calendar size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">每日使用总结</h3>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{dailySummary}</p>
            </div>

            {userProfile && userProfile.industry !== '未识别' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">您的画像</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">行业：</span>{userProfile.industry}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">角色：</span>{userProfile.role}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">风格：</span>{userProfile.workStyle}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setIsExpanded(true);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                开始对话
              </button>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 折叠状态 - 小头像显示在AI生图上方，可点击打开 */}
      {!isExpanded && (
        <div
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 50
          }}
        >
          <button
            onClick={() => {
              setIsExpanded(true);
              setIsMinimized(false);
            }}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center group"
          >
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* 展开状态 - 聊天框可拖拽，跟随页面滚动 */}
      {isExpanded && (
        <div
          ref={widgetRef}
          style={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '320px'
          }}
          className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col transition-shadow duration-200 ${
            isDragging ? 'shadow-3xl scale-105' : ''
          } ${isMinimized ? 'h-14' : 'h-[500px]'}`}
        >
          {/* 头部 - 只能通过拖拽图标拖拽 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <div
              className="drag-handle flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              title="拖拽移动"
            >
              <GripVertical size={16} className="opacity-70" />
              <Sparkles size={20} className="animate-pulse" />
              <span className="font-bold">AI 助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? '展开' : '最小化'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="关闭"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* 消息区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[350px] bg-white dark:bg-slate-900">
                {messages.length === 0 && !showGreeting && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Sparkles size={32} className="mx-auto mb-2 text-blue-500" />
                    <p>有什么可以帮您的吗？</p>
                  </div>
                )}

                {showGreeting && messages.length === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
                    <p className="text-blue-700 dark:text-blue-300">👋 欢迎回来！您今天有什么任务安排吗？</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%]">
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {/* AI回复下方显示直达按钮 */}
                      {msg.role === 'assistant' && suggestedFeature && index === messages.length - 1 && (
                        <button
                          onClick={() => navigate(`/backend?title=${encodeURIComponent(suggestedFeature)}`)}
                          className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                        >
                          <Sparkles size={16} />
                          进入 {suggestedFeature}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        思考中...
                      </span>
                      </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 快捷操作 */}
              {messages.length === 0 && (
                <div className="px-4 pb-3 space-y-2 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction('tasks')}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      📋 任务规划
                    </button>
                    <button
                      onClick={() => handleQuickAction('find')}
                      className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      🔍 功能查找
                    </button>
                    <button
                      onClick={() => handleQuickAction('optimize')}
                      className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      ✨ 提示词优化
                    </button>
                    <button
                      onClick={() => handleQuickAction('help')}
                      className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      ❓ 使用帮助
                    </button>
                  </div>

                  {/* 常用功能快捷入口 */}
                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">快捷功能：</p>
                    <div className="flex flex-wrap gap-1">
                      {['AI聊天', 'AI翻译大师', 'AI PPT制作', 'AI论文写作'].map(feature => (
                        <button
                          key={feature}
                          onClick={() => handleQuickFeature(feature)}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 输入区域 */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isTyping || !inputValue.trim()}
                    className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AICompanion;
