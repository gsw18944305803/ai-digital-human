import React, { useState, useEffect } from 'react';
import { 
  Link, 
  FileText, 
  ThumbsUp, 
  MessageCircle, 
  Star, 
  Share2, 
  Loader2, 
  Mic, 
  Search, 
  Play,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

const COZE_API_KEY = 'pat_SSVr01EaY6W2SfSmHC22atB4QQapqW63grmU4FPRbSGzB45zy0WDJCS2Ytnsw8EO';
const BOT_ID = '7597999195278376960';

const MultiPlatformVideoExtractor = () => {
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [data, setData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js";
    script.async = true;
    script.onload = () => {
      if (window.CozeWebSDK) {
        new window.CozeWebSDK.WebChatClient({
          config: {
            bot_id: '7597999195278376960',
          },
          componentProps: {
            title: 'Coze',
          },
          auth: {
            type: 'token',
            token: 'pat_SSVr01EaY6W2SfSmHC22atB4QQapqW63grmU4FPRbSGzB45zy0WDJCS2Ytnsw8EO',
            onRefreshToken: function () {
              return 'pat_SSVr01EaY6W2SfSmHC22atB4QQapqW63grmU4FPRbSGzB45zy0WDJCS2Ytnsw8EO'
            }
          },
          el: document.getElementById('coze-chat-container')
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleExtract = async () => {
    if (!url) return;
    
    setIsExtracting(true);
    setData(null);
    setError(null);
    setStatusMsg('正在连接 AI 服务...');

    try {
      // 1. Initiate Chat
      const chatResponse = await fetch('https://api.coze.cn/v3/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COZE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bot_id: BOT_ID,
          user_id: 'user_' + Date.now(),
          stream: false,
          auto_save_history: true,
          additional_messages: [
            {
              role: 'user',
              content: url,
              content_type: 'text'
            }
          ]
        })
      });

      if (!chatResponse.ok) {
        throw new Error(`连接服务失败: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      if (chatData.code !== 0) {
          throw new Error(`服务错误: ${chatData.msg || '未知错误'}`);
      }

      const chatId = chatData.data.id;
      const conversationId = chatData.data.conversation_id;

      // 2. Poll for completion
      let status = chatData.data.status;
      let retries = 0;
      const maxRetries = 60; // 2 minutes max

      while ((status === 'in_progress' || status === 'created') && retries < maxRetries) {
        setStatusMsg('正在解析视频数据...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const checkResponse = await fetch(`https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${COZE_API_KEY}`
          }
        });
        
        if (!checkResponse.ok) {
           throw new Error('检查状态失败');
        }
        
        const checkData = await checkResponse.json();
        status = checkData.data.status;
        retries++;
      }

      if (status !== 'completed') {
        throw new Error(`任务结束状态: ${status}`);
      }

      // 3. Get Messages
      setStatusMsg('获取解析结果...');
      const msgResponse = await fetch(`https://api.coze.cn/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${COZE_API_KEY}`
          }
      });

      if (!msgResponse.ok) {
        throw new Error('获取结果失败');
      }

      const msgData = await msgResponse.json();
      // Find the last assistant message that is an answer
      const assistantMsgs = msgData.data.filter(m => m.role === 'assistant' && m.type === 'answer');
      const lastMsg = assistantMsgs[assistantMsgs.length - 1];

      if (!lastMsg) {
        throw new Error('AI 未返回有效结果');
      }

      let parsedData;
      try {
        let content = lastMsg.content;
        // Clean markdown code blocks
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0];
            parsedData = JSON.parse(content);
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0];
            parsedData = JSON.parse(content);
        } else {
            // Attempt to parse stats from Markdown text
            // Helper function to extract number from line containing keyword
            const extractStat = (text, keywords) => {
                // Match line containing keyword, then capture number
                // Example: **👍 点赞数量：** 994 次
                // Regex: (?:keywords).*?(\d[\d,]*)
                const keywordPattern = keywords.join('|');
                const regex = new RegExp(`(?:${keywordPattern}).*?(\\d[\\d,]*)`);
                const match = text.match(regex);
                return match ? match[1] : '-';
            };

            const likes = extractStat(lastMsg.content, ['点赞数量', '点赞数']);
            const comments = extractStat(lastMsg.content, ['评论数量', '评论数']);
            const favorites = extractStat(lastMsg.content, ['收藏数量', '收藏数']);
            const shares = extractStat(lastMsg.content, ['分享数量', '分享数']);
            
            // Attempt to extract copy/title
            // Assume copy is between "文案内容" and the first stats line (usually likes)
            // Or extract based on the "文案内容：" marker
            let copyText = lastMsg.content;
            
            // Strategy 1: Match content between "文案内容：" and "点赞数量"
            // Handles markdown bolding/spacing variations
            const copyMatch = lastMsg.content.match(/(?:文案内容|文案).*?[:：]\s*\**\s*([\s\S]*?)(?=\n.*?(?:点赞|评论|收藏|分享))/i);
            
            if (copyMatch && copyMatch[1]) {
                copyText = copyMatch[1].trim();
                // Clean up leading/trailing markdown bold markers if any
                copyText = copyText.replace(/^\*\*/, '').replace(/\*\*$/, '');
            } else {
                // Strategy 2: If structure is different, try to just get the paragraph after "文案内容"
                // Assuming it starts on a new line or after the label
                const simpleMatch = lastMsg.content.match(/(?:文案内容|文案).*?[:：]\s*([\s\S]*?)$/);
                 if (simpleMatch) {
                    // This might take too much if stats are at the end, so we be careful
                    // But usually stats follow. Let's stick to the previous match or full content if fails.
                 }
            }

            parsedData = {
                platform: 'AI提取',
                author: '未知作者',
                title: '提取视频',
                cover: '',
                copy: copyText,
                audioTranscript: '',
                stats: {
                    likes: likes,
                    comments: comments,
                    favorites: favorites,
                    shares: shares
                }
            };
        }
      } catch (e) {
        console.warn('JSON parsing failed, using raw text', e);
        parsedData = {
            copy: lastMsg.content,
            audioTranscript: ''
        };
      }

      // Normalize data fields
      const normalizedData = {
          platform: parsedData.platform || 'AI提取',
          author: parsedData.author || '未知作者',
          title: parsedData.title || '提取视频',
          cover: parsedData.cover || '',
          copy: parsedData.copy || parsedData.text || lastMsg.content,
          audioTranscript: parsedData.audioTranscript || parsedData.transcript || '',
          stats: {
              likes: parsedData.stats?.likes || '-',
              comments: parsedData.stats?.comments || '-',
              favorites: parsedData.stats?.favorites || '-',
              shares: parsedData.stats?.shares || '-'
          }
      };

      setData(normalizedData);

    } catch (err) {
      console.error('Extraction Error:', err);
      setError(err.message || '提取失败，请重试');
    } finally {
      setIsExtracting(false);
      setStatusMsg('');
    }
  };

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 relative">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <Link size={18} />
          </span>
          多平台视频数据一键提取
          <div id="coze-chat-container" style={{ zIndex: 100 }}></div>
        </h2>
        <p className="text-sm text-gray-400 max-w-2xl">
          支持小红书、抖音视频链接解析。一键提取视频文案、音频转写内容及互动数据，辅助内容创作与分析。
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-ai-card border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Link className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="请粘贴小红书或抖音视频链接 (例如: https://www.xiaohongshu.com/...)"
              className="block w-full pl-11 pr-4 py-4 bg-ai-dark/50 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !url}
            className={`px-8 py-4 rounded-xl font-medium text-white shadow-lg transition-all flex items-center gap-2 justify-center min-w-[160px] ${
              isExtracting || !url
                ? 'bg-gray-700/50 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isExtracting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{statusMsg || '提取中...'}</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>开始提取</span>
              </>
            )}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
        
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            系统状态正常
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px] text-white font-bold">dou</span>
            支持抖音
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">红</span>
            支持小红书
          </span>
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
        {/* Stats & Copy */}
        <div className="space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '点赞', value: data?.stats?.likes || '-', icon: ThumbsUp, color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { label: '评论', value: data?.stats?.comments || '-', icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: '收藏', value: data?.stats?.favorites || '-', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: '转发', value: data?.stats?.shares || '-', icon: Share2, color: 'text-green-400', bg: 'bg-green-500/10' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-ai-card border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-white/10 transition-colors">
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center ${stat.color} mb-1`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-lg font-bold text-white">{stat.value}</span>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Video Copy */}
          <div className="bg-ai-card border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                <h3 className="font-medium text-gray-200">视频文案</h3>
              </div>
              <button 
                onClick={() => copyToClipboard(data?.copy, 'copy')}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="复制文案"
              >
                {copiedField === 'copy' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {data?.copy || '等待提取数据...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiPlatformVideoExtractor;
