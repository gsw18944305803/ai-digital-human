import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemConfig } from '../hooks/useSystemConfig';
import {
  ChevronDown,
  ChevronRight,
  Palette,
  Sparkles,
  ShoppingBag,
  Box,
  Languages,
  User,
  Mic,
  Gift,
  Shirt,
  FileText,
  Maximize,
  Cuboid,
  Cpu,
  Layers,
  Image as ImageIcon,
  UserCheck,
  BookOpen,
  Search,
  Database,
  CheckCircle,
  CreditCard,
  Scale,
  MessageSquare,
  Bot,
  LogIn,
  LogOut,
  X,
  Eye,
  EyeOff,
  Wand2,
  Video,
  TrendingUp,
  Mic2,
  FileEdit,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const systemConfig = useSystemConfig();
  const [expandedMenu, setExpandedMenu] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    inviteCode: ''
  });

  // 获取被隐藏的项目列表
  const hiddenItems = systemConfig?.layout?.hiddenSidebarItems || [];

  const toggleMenu = (menuName) => {
    if (expandedMenu === menuName) {
      setExpandedMenu('');
    } else {
      setExpandedMenu(menuName);
    }
  };

  const handleMockLogin = (provider) => {
    const title = 'AI数字员工';
    navigate(`/backend?title=${encodeURIComponent(title)}`);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password && loginForm.inviteCode) {
      // 1. 获取管理员创建的用户列表
      const savedUsers = localStorage.getItem('admin_users');
      let users = [];
      if (savedUsers) {
        try {
          users = JSON.parse(savedUsers);
        } catch (e) {
          console.error('Failed to parse admin_users', e);
        }
      }

      // 2. 验证账号是否存在且信息匹配
      const validUser = users.find(u => 
        u.username === loginForm.username && 
        u.password === loginForm.password && 
        u.inviteCode === loginForm.inviteCode &&
        u.status === 'active' // 必须是活跃状态
      );

      if (validUser) {
        // 3. 登录成功
        setCurrentUser({ 
          username: validUser.username, 
          role: validUser.role,
          permissions: validUser.permissions,
          credits: 1250 // 这里依然使用模拟积分，实际应从后端获取
        });
        setIsLoginModalOpen(false);
        setLoginForm({ username: '', password: '', inviteCode: '' });
      } else {
        // 4. 登录失败
        alert('登录失败：账号不存在、密码错误或邀请码无效。请联系管理员创建账号。');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const imageProcessingItems = [
    { title: '绘画机器人', desc: '支持Midjourney...', icon: Palette, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI老照片修复', desc: '老照片修复，高清...', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'AI电商场景图生成', desc: 'AI一键生成电商场...', icon: ShoppingBag, color: 'text-teal-400', bg: 'bg-teal-400/10', isAiEnhanced: true },
    { title: 'AI图片工具箱', desc: '智能处理和优化图...', icon: Box, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI 图片翻译', desc: '快速翻译并替换图...', icon: Languages, color: 'text-red-400', bg: 'bg-red-400/10', isAiEnhanced: true },
    { title: '证件照生成', desc: '快速生成各种通用...', icon: User, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI 头像制作', desc: '生成不同风格的自...', icon: User, color: 'text-green-400', bg: 'bg-green-400/10', isAiEnhanced: true },
    { title: 'AI照片说话', desc: '让照片开口说话', icon: Mic, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI 红包封面生成', desc: '使用AI生成红包封...', icon: Gift, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI 换衣', desc: '使用AI进行虚拟试穿', icon: Shirt, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI 矢量图生成', desc: '使用AI生成矢量图...', icon: FileText, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: '图片竞技场', desc: 'AI模型文生图能力...', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'AI 3D 建模', desc: '使用AI将图生成...', icon: Cuboid, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI绘图提示词专...', desc: '一键生成高质量图...', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10' },
  ].filter(item => !hiddenItems.includes(item.title));

  const informationProcessingItems = [
    { title: 'AI 聊天', desc: '与AI进行自由对话', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true, isStarred: true },
    { title: 'AI翻译大师', desc: '利用 AI 快速生成...', icon: Languages, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true, isStarred: true },
    { title: 'AI提示词专家', desc: 'AI 驱动的高级提示...', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/10', isAiEnhanced: true, isStarred: true },
    { title: 'AI搜索大师3.0', desc: '通过AI搜索，节省...', icon: Search, color: 'text-orange-400', bg: 'bg-orange-400/10', isAiEnhanced: true },
    { title: '网页数据提取工具', desc: '将网页内容通过AI...', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10', isAiEnhanced: true },
  ].filter(item => !hiddenItems.includes(item.title));

  const workEfficiencyItems = [
    { title: 'AI文案助手', desc: '文案创作得力助手', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10', isAiEnhanced: true },
    { title: 'AI电商文案助手', desc: '告别电商文案难题', icon: ShoppingBag, color: 'text-teal-400', bg: 'bg-teal-400/10', isAiEnhanced: true },
    { title: 'AI文档编辑器', desc: '一键生成长文档', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI PPT制作', desc: '一键生成高质量演示文稿', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10', isAiEnhanced: true },
  ].filter(item => !hiddenItems.includes(item.title));

  const codeRelatedItems = [
    { title: 'AI网页生成器', desc: '轻松生成网页页面', icon: Box, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI网页生成器2.0', desc: '一键生成高质量网页', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: '代码竞技场', desc: '比拼AI代码能力', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: '网页一键部署', desc: '一键部署静态网页', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ].filter(item => !hiddenItems.includes(item.title));

  const academicItems = [
    { title: 'AI学术论文搜索', desc: '对学术论文进行搜索与分析', icon: Search, color: 'text-purple-400', bg: 'bg-purple-400/10', isAiEnhanced: true },
    { title: 'PDF全能工具箱', desc: '一站式处理各类PDF', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10', isAiEnhanced: true },
    { title: 'AI专利搜索', desc: '快速检索专利信息', icon: Search, color: 'text-teal-400', bg: 'bg-teal-400/10', isAiEnhanced: true },
    { title: 'AI论文写作', desc: '辅助撰写与润色论文', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI答题机', desc: '对问题进行解答讲解', icon: Cpu, color: 'text-green-400', bg: 'bg-green-400/10', isAiEnhanced: true },
  ].filter(item => !hiddenItems.includes(item.title));

  const audioItems = [
    { title: 'AI语音生成器', desc: '将文本转换成自然语音', icon: Mic, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 音乐制作', desc: '用AI生成音乐作品', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI 播客制作', desc: '生成完整播客音频', icon: Gift, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI 语音通话', desc: '与AI进行语音聊天', icon: User, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: '语音竞技场', desc: '比拼语音生成表现', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ].filter(item => !hiddenItems.includes(item.title));

  // 实用工具菜单
  const utilityToolsItems = [
    { title: 'AI文案提取与分析', desc: '提取视频文案+AI智能分析', icon: FileEdit, color: 'text-purple-400', bg: 'bg-purple-400/10', isAiEnhanced: true },
    { title: '音视频转文章', desc: '一键将音视频转化为文章', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10', isAiEnhanced: true },
    { title: 'AI处理Excel', desc: '一句话搞定复杂表格', icon: Database, color: 'text-green-400', bg: 'bg-green-400/10', isAiEnhanced: true },
    { title: '免费API汇总', desc: '全球免费API资源库', icon: Globe, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'TTS声音克隆', desc: '开源多音字声音克隆', icon: Mic2, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: '抓取爆款视频', desc: '一键抓取关键词爆款视频', icon: Video, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: '热点实时聚合', desc: 'GitHub热点实时推送', icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { title: '远程控制工具', desc: '开源免费远程控制', icon: User, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'AI短剧零剪辑', desc: 'AI自动剪辑短剧工具', icon: Wand2, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { title: '批量视频制作', desc: 'AI批量生成营销视频', icon: Video, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ].filter(item => !hiddenItems.includes(item.title));

  const isConfigured = (title) => {
    if (!systemConfig) return false;

    // 优先检查 features 配置
    const feature = systemConfig.features?.[title];
    if (feature) {
      // 检查是否有 API Key 或任何 URL 字段
      if (feature.apiKey) return true;
      const urlFields = ['apiUrl', 'resultUrl', 'uploadUrl', 'cloneUrl', 'ttsUrl', 'submitUrl', 'toolsUrl', 'outlineUrl', 'contentUrl', 'syncPptUrl', 'parseUrl', 'statusUrl', 'templateUrl', 'templatesListUrl', 'loadUrl', 'downloadUrl', 'directGenerateUrl', 'schemaUrl'];
      return urlFields.some(field => feature[field] && feature[field] !== '');
    }

    // 检查核心模型配置
    if (title === 'AI对话 (AIChat)' || title === 'AI 聊天') {
      const chat = systemConfig.models?.chat;
      return chat && (chat.apiKey || chat.apiUrl);
    }
    if (title === 'AI生图 (DALL-E)') {
      const image = systemConfig.models?.image;
      return image && (image.apiKey || image.apiUrl);
    }
    if (title === 'Sora2 视频生成') {
      const sora = systemConfig.models?.sora;
      return sora && (sora.apiKey || sora.submitUrl);
    }

    return false;
  };

  // 判断是否显示红*标记
  const shouldShowStar = (categoryName, itemTitle) => {
    // 代码相关：不显示*
    if (categoryName === '代码相关') return false;

    // 音频相关：只显示"AI语音生成器"的*
    if (categoryName === '音频相关') {
      return itemTitle === 'AI语音生成器';
    }

    // 学术相关：只显示"AI���术论文搜索"、"AI论文写作"、"AI答题机"的*
    if (categoryName === '学术相关') {
      return itemTitle === 'AI学术论文搜索' ||
             itemTitle === 'AI论文写作' ||
             itemTitle === 'AI答题机';
    }

    // 其他类别：显示*
    return true;
  };

  const menuItems = [
    { name: '图片处理', hasSubmenu: true, items: imageProcessingItems },
    { name: '信息处理', hasSubmenu: true, items: informationProcessingItems },
    { name: '工作效率', hasSubmenu: true, items: workEfficiencyItems },
    { name: '代码相关', hasSubmenu: true, items: codeRelatedItems },
    { name: '学术相关', hasSubmenu: true, items: academicItems },
    { name: '音频相关', hasSubmenu: true, items: audioItems },
    { name: '实用工具', hasSubmenu: true, items: utilityToolsItems }
  ];

  const [isDarkMode, setIsDarkMode] = useState(
    document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light')
  );

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(
            document.body.classList.contains('theme-dark') || !document.body.classList.contains('theme-light')
          );
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className={`w-64 border-r flex flex-col h-screen sticky top-0 font-sans overflow-hidden shadow-lg z-50 transition-colors duration-300
      ${isDarkMode 
        ? 'bg-ai-dark border-white/5 text-gray-200' 
        : 'bg-white border-gray-200 text-gray-900'
      }`}>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500/10 text-blue-600'}`}>
            <Bot size={18} />
          </div>
          <div>
            <h1 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI数字员工</h1>
            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Digital Workforce</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-6">
        <input
          type="text"
          placeholder="搜索..."
          className={`w-full border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm
            ${isDarkMode 
              ? 'bg-ai-card border-white/5 text-gray-100 placeholder-gray-400' 
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.items && item.items.length === 0) return null;
          
          return (
            <div key={index}>
              <div
                onClick={() => item.hasSubmenu && toggleMenu(item.name)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all group 
                  ${expandedMenu === item.name 
                    ? (isDarkMode ? 'bg-ai-card text-white' : 'bg-blue-50 text-blue-600')
                    : (isDarkMode ? 'hover:bg-ai-card text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900')
                  }`}
              >
                <span className={`font-medium text-[15px]`}>
                  {item.name}
                </span>
                {item.hasSubmenu ? (
                  expandedMenu === item.name ? (
                    <ChevronDown size={16} className={isDarkMode ? "text-gray-300" : "text-blue-500"} />
                  ) : (
                    <ChevronRight size={16} className={`${isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  )
                ) : (
                  <ChevronRight size={16} className={`${isDarkMode ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                )}
              </div>
              
              {item.hasSubmenu && expandedMenu === item.name && (
                <div className="pl-4 pr-2 py-2 space-y-1">
                  {item.items.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} 
                      className={`flex items-start p-2 rounded-lg cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 relative
                        ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}
                      `}
                    >
                      <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                        <subItem.icon size={16} className={subItem.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-start text-sm font-medium ${isDarkMode ? 'text-gray-200 group-hover/item:text-white' : 'text-gray-700 group-hover/item:text-gray-900'}`}>
                          <span className="truncate">{subItem.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                      </div>
                      {isConfigured(subItem.title) && shouldShowStar(item.name, subItem.title) ? (
                        <div className="absolute top-1 right-2 text-red-500 text-lg leading-none">*</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {!currentUser && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all group shadow-sm
              ${isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                : 'bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
              }`}
          >
            <LogIn size={20} className={`${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
            <span className="font-medium text-sm">登录</span>
          </button>
        </div>
      )}

      {currentUser && (
        <div className={`p-4 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm shadow-md
              ${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'}`}>
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{currentUser.username}</div>
              <div className={`text-xs truncate font-medium ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>剩余算力: {currentUser.credits}</div>
            </div>
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg transition-colors
                ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b26] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">登录账号</h2>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">账号</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="请输入账号"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-10"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">邀请码</label>
                <input
                  type="text"
                  value={loginForm.inviteCode}
                  onChange={(e) => setLoginForm({...loginForm, inviteCode: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="请输入邀请码"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-xl transition-all duration-200 mt-2"
              >
                立即登录
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
