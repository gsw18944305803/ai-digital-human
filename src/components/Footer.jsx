import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-ai-card border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              玄兽AIGC
            </span>
            <p className="text-gray-500 text-sm mt-2">
              © 2024 玄兽AIGC. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">服务条款</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">联系我们</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
