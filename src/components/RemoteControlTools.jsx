import React, { useState } from 'react';
import { User, Link2, Shield, Copy, Check, ExternalLink, Search, Clock, Star } from 'lucide-react';

const RemoteControlTools = () => {
  const [copied, setCopied] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    {
      id: 1,
      name: 'AnyDesk',
      desc: '快速、安全的远程桌面软件，支持跨平台',
      url: 'https://anydesk.com',
      category: '商业软件',
      features: ['低延迟', '加密传输', '免费个人版'],
      rating: 4.5
    },
    {
      id: 2,
      name: 'Chrome Remote Desktop',
      desc: 'Google 推出的远程桌面扩展，简单易用',
      url: 'https://remotedesktop.google.com',
      category: '免费开源',
      features: ['完全免费', '跨平台', 'Google账户集成'],
      rating: 4.3
    },
    {
      id: 3,
      name: 'RustDesk',
      desc: '开源免费的远程桌面软件，可自建服务器',
      url: 'https://rustdesk.com',
      category: '免费开源',
      features: ['完全开源', '自建服务器', '跨平台'],
      rating: 4.7
    },
    {
      id: 4,
      name: 'Apache Guacamole',
      desc: '无客户端的远程桌面网关，基于HTML5',
      url: 'https://guacamole.apache.org',
      category: '免费开源',
      features: ['浏览器访问', '无客户端', '支持RDP/VNC'],
      rating: 4.4
    },
    {
      id: 5,
      name: 'NoMachine',
      desc: '高性能远程桌面软件，免费版功能强大',
      url: 'https://www.nomachine.com',
      category: '免费软件',
      features: ['高清画质', '多会话', '免费版无限制'],
      rating: 4.2
    },
    {
      id: 6,
      name: 'Remmina',
      desc: 'Linux下的远程桌面客户端，功能丰富',
      url: 'https://remmina.org',
      category: '免费开源',
      features: ['Linux原生', '多协议支持', '插件系统'],
      rating: 4.5
    },
    {
      id: 7,
      name: 'Parsec',
      desc: '低延迟远程桌面，适合游戏和创意工作',
      url: 'https://parsec.app',
      category: '商业软件',
      features: ['超低延迟', '高画质', '适合游戏'],
      rating: 4.6
    },
    {
      id: 8,
      name: 'Sunlogin (向日葵)',
      desc: '国内知名远程控制软件，功能全面',
      url: 'https://sunlogin.oray.com',
      category: '商业软件',
      features: ['中文界面', '功能丰富', '国产软件'],
      rating: 4.0
    },
  ];

  const categories = ['全部', '免费开源', '商业软件', '免费软件'];

  const [selectedCategory, setSelectedCategory] = useState('全部');

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      '免费开源': 'text-green-400 bg-green-400/10',
      '商业软件': 'text-blue-400 bg-blue-400/10',
      '免费软件': 'text-purple-400 bg-purple-400/10',
    };
    return colors[category] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <User className="text-blue-500" />
          远程控制工具
        </h2>
        <p className="text-sm text-gray-400">
          优质远程桌面软件推荐，支持跨平台远程访问
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-ai-card border border-white/5 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索远程控制工具..."
            className="w-full bg-ai-dark/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-ai-card border border-white/5 text-gray-400 hover:text-white hover:border-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-ai-card border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-medium">{tool.rating}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {tool.desc}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tool.features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors no-underline"
              >
                <Link2 size={14} />
                访问官网
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => handleCopy(tool.id, tool.url)}
                className="h-10 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                title="复制链接"
              >
                {copied === tool.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="bg-ai-card border border-white/5 rounded-xl p-12 text-center">
          <Search className="text-gray-600 mx-auto mb-4" size={48} />
          <p className="text-gray-400">未找到匹配的工具</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="text-green-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="text-green-300 font-medium mb-1">安全提示</p>
              <p className="text-gray-400">
                使用远程控制软件时，请确保通过官方渠道下载，并启用两步验证保护账户安全。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">网络要求</p>
              <p className="text-gray-400">
                远程控制需要稳定的网络连接，建议使用有线网络或5GHz WiFi以获得最佳体验。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Star className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <p className="text-purple-300 font-medium mb-1">选择建议</p>
              <p className="text-gray-400">
                个人用户推荐 RustDesk 或 Chrome Remote Desktop，商业用户可考虑 AnyDesk 或 Parsec。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteControlTools;
