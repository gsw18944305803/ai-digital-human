import React, { useState } from 'react';

const AppsManagement = () => {
  const [apps, setApps] = useState([
    {
      id: 1,
      name: 'AI写作助手',
      description: '智能生成各类文章、文案内容',
      icon: '✍️',
      category: 'content',
      status: 'published',
      users: 5680,
      rating: 4.8,
      version: '2.5.0',
      apiCalls: 125680,
      revenue: 15680
    },
    {
      id: 2,
      name: '视频生成器',
      description: 'AI自动生成高质量视频内容',
      icon: '🎬',
      category: 'video',
      status: 'published',
      users: 3240,
      rating: 4.9,
      version: '1.8.0',
      apiCalls: 89230,
      revenue: 22450
    },
    {
      id: 3,
      name: '智能配音',
      description: '文字转语音，多种音色选择',
      icon: '🎙️',
      category: 'audio',
      status: 'published',
      users: 4560,
      rating: 4.7,
      version: '3.2.0',
      apiCalls: 156780,
      revenue: 18230
    },
    {
      id: 4,
      name: '数字人直播',
      description: 'AI数字人24小时自动直播',
      icon: '👤',
      category: 'avatar',
      status: 'beta',
      users: 890,
      rating: 4.5,
      version: '1.0.0',
      apiCalls: 12340,
      revenue: 5670
    },
    {
      id: 5,
      name: 'AI绘画',
      description: '文字生成图片，创意无限',
      icon: '🎨',
      category: 'image',
      status: 'published',
      users: 6780,
      rating: 4.6,
      version: '2.1.0',
      apiCalls: 234560,
      revenue: 28900
    },
    {
      id: 6,
      name: '多语言翻译',
      description: '支持100+语言智能翻译',
      icon: '🌍',
      category: 'translate',
      status: 'development',
      users: 0,
      rating: 0,
      version: '0.5.0',
      apiCalls: 0,
      revenue: 0
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredApps = apps.filter(a => {
    const matchesStatus = filter === 'all' || a.status === filter;
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const stats = {
    total: apps.length,
    published: apps.filter(a => a.status === 'published').length,
    beta: apps.filter(a => a.status === 'beta').length,
    development: apps.filter(a => a.status === 'development').length,
    totalUsers: apps.reduce((sum, a) => sum + a.users, 0),
    totalRevenue: apps.reduce((sum, a) => sum + a.revenue, 0),
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      beta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      development: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    const labels = {
      published: '已发布',
      beta: '内测中',
      development: '开发中',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      content: '内容',
      video: '视频',
      audio: '音频',
      avatar: '数字人',
      image: '图片',
      translate: '翻译',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">应用总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已发布</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">内测中</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.beta}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总用户</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总营收</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">¥{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部分类</option>
              <option value="content">内容</option>
              <option value="video">视频</option>
              <option value="audio">音频</option>
              <option value="avatar">数字人</option>
              <option value="image">图片</option>
              <option value="translate">翻译</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="beta">内测中</option>
              <option value="development">开发中</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 创建应用
          </button>
        </div>
      </div>

      {/* 应用卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div key={app.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl">
              {app.icon}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{app.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getCategoryLabel(app.category)} · v{app.version}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{app.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{app.users.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">用户</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">¥{app.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">营收</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span>{app.rating.toFixed(1)}</span>
                </div>
                <div>{app.apiCalls.toLocaleString()} 次调用</div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  管理
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                  数据
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsManagement;
