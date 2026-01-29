import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2, Plus, MessageSquare, Clock, Menu, Search, X } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

// 简单的 ID 生成器
const generateId = () => Math.random().toString(36).substr(2, 9);

const AIChat = () => {
  const config = useSystemConfig();
  // --- State ---
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Effects ---

  // 1. 初始化加载 Sessions
  useEffect(() => {
    const savedSessions = localStorage.getItem('ai_chat_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      // 如果有 Session，默认不自动选中，保持“新聊天”状态，或者可以选中最后一个
      // 这里为了复刻 DeepSeek 首页，默认进入“新聊天”状态 (currentSessionId = null)
    }
  }, []);

  // 2. 切换 Session 时加载消息
  useEffect(() => {
    if (currentSessionId) {
      const savedMessages = localStorage.getItem(`ai_chat_messages_${currentSessionId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]); // 新聊天，清空消息
    }
    setInput('');
  }, [currentSessionId]);

  // 3. 自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 4. 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- Handlers ---

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    localStorage.setItem('ai_chat_sessions', JSON.stringify(newSessions));
    localStorage.removeItem(`ai_chat_messages_${sessionId}`);

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const saveSessionData = (sessionId, msgs) => {
    // 保存消息
    localStorage.setItem(`ai_chat_messages_${sessionId}`, JSON.stringify(msgs));

    // 更新或创建 Session 元数据
    setSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === sessionId);
      let newSessions;
      
      if (existingIndex >= 0) {
        newSessions = [...prev];
        newSessions[existingIndex] = { ...newSessions[existingIndex], updatedAt: Date.now() };
      } else {
        // 新 Session，生成标题（取第一条用户消息的前 20 个字）
        const firstUserMsg = msgs.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : '新对话';
        const newSession = {
          id: sessionId,
          title: title,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        newSessions = [newSession, ...prev];
      }
      
      localStorage.setItem('ai_chat_sessions', JSON.stringify(newSessions));
      return newSessions;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage = { role: 'user', content: userContent };
    
    // 确定 Session ID
    let activeSessionId = currentSessionId;
    let newMessages = [...messages, userMessage];

    if (!activeSessionId) {
      activeSessionId = generateId();
      setCurrentSessionId(activeSessionId);
    }

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // 立即保存用户消息
    saveSessionData(activeSessionId, newMessages);

    try {
      const apiKey = config.models.chat?.apiKey || 'sk-Rc1j1a6cfUeWlOZYHgXikivqfrUpOdUlGz2ziD772dXFEFZd';
      const apiUrl = config.models.chat?.apiUrl || 'https://api.302.ai/chat/completions';
      const modelName = config.models.chat?.modelName || 'gpt-4o';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            ...newMessages
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || '抱歉，我没有理解你的意思。';
      
      const aiMessage = { role: 'assistant', content: aiContent };
      const finalMessages = [...newMessages, aiMessage];
      
      setMessages(finalMessages);
      saveSessionData(activeSessionId, finalMessages);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant', content: '抱歉，遇到了一些问题，请稍后再试。' };
      setMessages(prev => [...prev, errorMessage]);
      // 错误消息也保存，防止丢失上下文
      saveSessionData(activeSessionId, [...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Render ---

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#1e1e1e] text-gray-100 overflow-hidden rounded-2xl border border-white/5 shadow-2xl font-sans">
      
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-[#252526] flex-shrink-0 transition-all duration-300 flex flex-col border-r border-white/5 overflow-hidden`}>
        <div className="p-4">
          <button 
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            <span>开启新对话</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
          <div className="text-xs font-medium text-gray-500 px-4 py-2 mb-2">历史记录</div>
          <div className="space-y-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  if (window.innerWidth < 768) setShowSidebar(false);
                }}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                  currentSessionId === session.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <div className="flex-1 truncate text-sm">
                  {session.title}
                </div>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all absolute right-2"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-xs">
                暂无历史记录
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#1e1e1e]">
        {/* Toggle Sidebar Button (Mobile/Desktop) */}
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-4 top-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Content */}
        {messages.length === 0 ? (
          // --- Empty State (DeepSeek Style) ---
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-semibold text-white mb-2">Hi，钱老师</h1>
              <p className="text-gray-400">我是你的 AI 智能助手，有什么可以帮你的吗？</p>
            </div>

            <div className="w-full max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#2d2d2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入你的问题，开启深度对话..."
                    className="w-full bg-transparent border-none text-gray-100 text-base px-6 py-4 focus:ring-0 resize-none outline-none custom-scrollbar placeholder-gray-500"
                    rows={1}
                    style={{ minHeight: '60px', maxHeight: '200px' }}
                  />
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-gray-200 transition-colors border border-white/5">
                        <Search size={12} />
                        <span>联网搜索</span>
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-gray-200 transition-colors border border-white/5">
                        <Bot size={12} />
                        <span>深度思考</span>
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        input.trim() 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500' 
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                {['解释量子纠缠', '写一段 Python 爬虫', '制定健身计划', '分析财报数据'].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(suggestion);
                      // Optional: Auto send
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // --- Chat State ---
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                    ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-blue-500/20 text-blue-400'}
                  `}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`
                    max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-[#2b2b2b] text-gray-100 rounded-tr-none border border-white/5' 
                      : 'bg-transparent text-gray-200 rounded-tl-none'}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 max-w-3xl mx-auto">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                  <div className="px-5 py-3.5 flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400">正在思考...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sticky Input Area */}
            <div className="p-4 md:p-6 bg-[#1e1e1e]/95 backdrop-blur-sm border-t border-white/5">
              <div className="max-w-3xl mx-auto relative bg-[#2d2d2d] border border-white/10 rounded-xl shadow-lg">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="发送消息给 AI..."
                  className="w-full bg-transparent border-none text-gray-100 text-sm px-4 py-3 pr-12 focus:ring-0 resize-none outline-none custom-scrollbar placeholder-gray-500"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '150px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-all ${
                    input.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-500' 
                      : 'bg-transparent text-gray-500'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-600 mt-2">
                内容由 AI 生成，请注意甄别。模型：GPT-4o
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;
