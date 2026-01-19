import React from 'react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-ai-dark pt-16 pb-32">
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-ai-dark to-ai-dark pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          让您 <span className="text-blue-500">秒变AI高手</span>
          <br />
          是我们的追求
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          探索无限创意可能，利用最前沿的 AI 技术，释放您的想象力。
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-blue-500/20">
            开始创作
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all backdrop-blur-sm">
            了解更多
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
