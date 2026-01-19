import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Palette, Video, TrendingUp, Film, Clapperboard, BookOpen, Users } from 'lucide-react';

const tools = [
  {
    title: 'AI生图',
    desc: '输入提示词，一键生成高质量创意图片',
    icon: Image,
    color: 'text-pink-500'
  },
  {
    title: '一站式视频创作流水线',
    desc: '跨平台抓取热门内容，AI智能创作，一键高效发布。',
    icon: Palette,
    color: 'text-purple-500'
  },
  {
    title: 'Sora2 视频生成',
    desc: '输入文案即可生成创意视频',
    icon: Video,
    color: 'text-blue-500'
  },
  {
    title: '多平台视频数据一键提取',
    desc: '通过链接提取小红书、抖音视频的文案、视频内容以及互动数据',
    icon: Users,
    color: 'text-red-500'
  },
  {
    title: '宣传海报、视频制作',
    desc: '上传素材自动生成产品宣传视频',
    icon: Film,
    color: 'text-orange-500'
  },
  {
    title: 'Veo3.1 视频生成',
    desc: '使用高级模型生成逼真视频',
    icon: Clapperboard,
    color: 'text-indigo-500'
  },
  {
    title: 'Sora2 故事板',
    desc: '生成多场景连续故事视频',
    icon: BookOpen,
    color: 'text-yellow-500'
  },
  {
    title: '招商加盟',
    desc: '一键生成招商加盟方案与宣传物料',
    icon: TrendingUp,
    color: 'text-green-500'
  }
];

const ToolsGrid = () => {
  const navigate = useNavigate();
  return (
    <section id="tools" className="py-40 bg-ai-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tools.map((tool, index) => (
            <div key={index} onClick={() => navigate(`/backend?title=${encodeURIComponent(tool.title)}`)} className="bg-ai-dark border border-white/5 rounded-2xl p-10 transition-all duration-200 group cursor-pointer hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/30">
              <div className={`mb-4 ${tool.color} bg-white/5 w-16 h-16 mb-6 rounded-xl flex items-center justify-center`}>
                <tool.icon size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">{tool.title}</h3>
              <p className="text-gray-400 text-sm">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;
