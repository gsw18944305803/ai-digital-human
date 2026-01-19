import React from 'react';
import { Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-white/10 bg-ai-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              玄兽AIGC
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">首页</a>
                <a href="#tools" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">AI 工具</a>
                <a href="#showcase" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">案例展示</a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">关于我们</a>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button className="text-gray-300 hover:text-white p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
