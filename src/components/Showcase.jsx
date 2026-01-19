import React, { useState } from 'react';

const tabs = [
  "全部", "AI生图", "风格转换", "Sora2视频", "一键出大片", "Veo3.1视频"
];

const Showcase = () => {
  const [activeTab, setActiveTab] = useState("全部");

  return (
    <section id="showcase" className="py-20 bg-ai-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">客户案例展示</h2>
          <p className="text-gray-400">激发灵感，探索 AI 创作的无限可能</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无灵感作品</h3>
          <p className="text-gray-400">管理员正在为您准备精彩内容</p>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
