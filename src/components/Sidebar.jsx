import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Bot
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

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

  const imageProcessingItems = [
    { title: '绘画机器人', desc: '支持Midjourney...', icon: Palette, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI老照片修复', desc: '老照片修复，高清...', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'AI电商场景图生成', desc: 'AI一键生成电商场...', icon: ShoppingBag, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI图片工具箱', desc: '智能处理和优化图...', icon: Box, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 图片翻译', desc: '快速翻译并替换图...', icon: Languages, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: '证件照生成', desc: '快速生成各种通用...', icon: User, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 头像制作', desc: '生成不同风格的自...', icon: User, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI照片说话', desc: '让照片开口说话', icon: Mic, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI 红包封面生成', desc: '使用AI生成红包封...', icon: Gift, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI 换衣', desc: '使用AI进行虚拟试穿', icon: Shirt, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 矢量图生成', desc: '使用AI生成矢量图...', icon: FileText, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: '图片竞技场', desc: 'AI模型文生图能力...', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'AI 3D 建模', desc: '使用AI将图生成...', icon: Cuboid, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Lora风格创意站', desc: '训练和使用Lora模...', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'ComfyUI工具箱', desc: '通过ComfyUI复杂...', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI绘图提示词专...', desc: '一键生成高质量图...', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI 图像创意站', desc: '探索GPT-Image-1...', icon: ImageIcon, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI 人像创意站', desc: '传入人像照片，生...', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const informationProcessingItems = [
    { title: 'AI翻译大师', desc: '利用 AI 快速生成...', icon: Languages, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI提示词专家', desc: 'AI 驱动的高级提示...', icon: BookOpen, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI搜索大师3.0', desc: '通过AI搜索，节省...', icon: Search, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: '网页数据提取工具', desc: '将网页内容通过AI...', icon: Database, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI提示词专家2.0', desc: '一键生成高质量提...', icon: BookOpen, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI事实求证', desc: '使用Jina和Exa搜...', icon: CheckCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI 卡片生成', desc: '使用AI生成多种类...', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 模型判官', desc: 'AI模型评测工具', icon: Scale, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  const workEfficiencyItems = [
    { title: '模型竞技场', desc: '所有AI模型一起回答', icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: 'AI文案助手', desc: '文案创作得力助手', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI电商文案助手', desc: '告别电商文案难题', icon: ShoppingBag, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI文档编辑器', desc: '一键生成长文档', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI PPT制作', desc: '一键生成高质量演示文稿', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI 网页总结', desc: '一键概括网页重点内容', icon: Database, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI 画图版', desc: '在白板上快速画图', icon: Box, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI 财讯助手', desc: '获取财经资讯与解读', icon: Layers, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI Excel', desc: '对表格进行分析处理', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 简历制作', desc: '生成高质量求职简历', icon: User, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI 小说写作', desc: '进行长篇小说创作', icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  const codeRelatedItems = [
    { title: 'AI网页生成器', desc: '轻松生成网页页面', icon: Box, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI网页生成器2.0', desc: '一键生成高质量网页', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: '代码竞技场', desc: '比拼AI代码能力', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: '网页一键部署', desc: '一键部署静态网页', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  const videoRelatedItems = [
    { title: 'AI视频素材创意站', desc: '输入关键词自动生成视频素材', icon: ImageIcon, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI视频生成器', desc: '通过文字和图片生成视频', icon: Cuboid, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI音视频总结', desc: '提取视频音频精华内容', icon: Database, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI视频实时翻译', desc: '实时翻译视频内容', icon: Languages, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI视频深度翻译', desc: '逐句润色视频翻译', icon: Languages, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: '视频竞技场', desc: '比拼视频生成能力', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { title: '数字人生生成', desc: '生成数字人分身视频', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const academicItems = [
    { title: 'AI学术论文搜索', desc: '对学术论文进行搜索与分析', icon: Search, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'PDF全能工具箱', desc: '一站式处理各类PDF', icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'AI专利搜索', desc: '快速检索专利信息', icon: Search, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: 'AI论文写作', desc: '辅助撰写与润色论文', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI答题机', desc: '对问题进行解答讲解', icon: Cpu, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  const audioItems = [
    { title: 'AI语音生成器', desc: '将文本转换成自然语音', icon: Mic, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI 音乐制作', desc: '用AI生成音乐作品', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'AI 播客制作', desc: '生成完整播客音频', icon: Gift, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'AI 语音通话', desc: '与AI进行语音聊天', icon: User, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { title: '语音竞技场', desc: '比拼语音生成表现', icon: Maximize, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  const menuItems = [
    { name: '图片处理', hasSubmenu: true },
    { name: '信息处理', hasSubmenu: true },
    { name: '工作效率', hasSubmenu: true },
    { name: '代码相关', hasSubmenu: true },
    { name: '视频相关', hasSubmenu: true },
    { name: '学术相关', hasSubmenu: true },
    { name: '音频相关', hasSubmenu: true }
  ];

  return (
    <aside className="w-64 bg-ai-dark border-r border-white/5 flex flex-col h-screen sticky top-0 text-gray-200 font-sans overflow-hidden">
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Bot size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white leading-tight">AI数字员工</h1>
            <p className="text-[11px] text-gray-400">AI Digital Workforce</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-6">
        <input
          type="text"
          placeholder="搜索..."
          className="w-full bg-ai-card border border-white/5 rounded-2xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder-gray-400"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
        {menuItems.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => item.hasSubmenu && toggleMenu(item.name)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-all group ${expandedMenu === item.name ? 'bg-ai-card' : 'hover:bg-ai-card'}`}
            >
              <span className={`font-normal text-[15px] ${expandedMenu === item.name ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {item.name}
              </span>
              {item.hasSubmenu ? (
                expandedMenu === item.name ? (
                   <ChevronDown size={16} className="text-gray-300" />
                ) : (
                   <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-300" />
                )
              ) : (
                 <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-300" />
              )}
            </div>
            
            {item.name === '图片处理' && expandedMenu === '图片处理' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {imageProcessingItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '信息处理' && expandedMenu === '信息处理' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {informationProcessingItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '工作效率' && expandedMenu === '工作效率' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {workEfficiencyItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '代码相关' && expandedMenu === '代码相关' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {codeRelatedItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '视频相关' && expandedMenu === '视频相关' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {videoRelatedItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '学术相关' && expandedMenu === '学术相关' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {academicItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {item.name === '音频相关' && expandedMenu === '音频相关' && (
              <div className="pl-4 pr-2 py-2 space-y-1">
                {audioItems.map((subItem, subIndex) => (
                  <div
                    key={subIndex}
                    onClick={() => navigate(`/backend?title=${encodeURIComponent(subItem.title)}`)} className="flex items-start p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group/item hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className={`p-2 rounded-lg ${subItem.bg} mr-3 mt-0.5 transition-transform duration-200 group-hover/item:scale-110`}>
                      <subItem.icon size={16} className={subItem.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 group-hover/item:text-white truncate">{subItem.title}</div>
                      <div className="text-xs text-gray-500 truncate">{subItem.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {currentUser ? (
        <div className="px-4 py-4 border-t border-white/5">
          <div className="bg-ai-card rounded-2xl px-4 py-4 flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border border-white/10"
            />
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">已通过 {currentUser.provider} 登录</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-t border-white/5">
          <div className="bg-ai-card rounded-2xl px-4 py-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-3">
              <User size={24} className="text-gray-200" />
            </div>
            <div className="text-sm text-white mb-1">未登录</div>
            <div className="px-3 py-0.5 rounded-full border border-emerald-500/40 text-[11px] text-emerald-400 mb-4">
              0 算力
            </div>
            <button
              onClick={() => handleMockLogin('AI数字员工')}
              className="w-full py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 transition-colors"
            >
              登录
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
