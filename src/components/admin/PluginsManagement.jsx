import React, { useState } from 'react';

const PluginsManagement = () => {
  const [plugins, setPlugins] = useState([
    {
      id: 1,
      name: '微信登录',
      description: '支持用户使用微信账号快速登录',
      version: '1.2.0',
      status: 'active',
      author: '官方',
      installs: 1258,
      rating: 4.8,
      icon: '💬',
      category: 'auth'
    },
    {
      id: 2,
      name: '数据统计',
      description: '详细的用户行为数据统计分析',
      version: '2.1.0',
      status: 'active',
      author: '官方',
      installs: 986,
      rating: 4.9,
      icon: '📊',
      category: 'analytics'
    },
    {
      id: 3,
      name: '邮件通知',
      description: '系统事件邮件提醒功能',
      version: '1.0.5',
      status: 'inactive',
      author: '第三方',
      installs: 234,
      rating: 4.2,
      icon: '📧',
      category: 'notification'
    },
    {
      id: 4,
      name: '阿里云OSS',
      description: '文件存储到阿里云OSS',
      version: '1.5.0',
      status: 'active',
      author: '官方',
      installs: 567,
      rating: 4.7,
      icon: '☁️',
      category: 'storage'
    },
    {
      id: 5,
      name: 'AI内容审核',
      description: '自动审核用户生成内容',
      version: '2.0.0',
      status: 'update',
      author: '官方',
      installs: 890,
      rating: 4.6,
      icon: '🔍',
      category: 'content'
    },
    {
      id: 6,
      name: '优惠券系统',
      description: '创建和管理优惠券',
      version: '1.3.0',
      status: 'inactive',
      author: '第三方',
      installs: 123,
      rating: 4.0,
      icon: '🎫',
      category: 'marketing'
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredPlugins = plugins.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const stats = {
    total: plugins.length,
    active: plugins.filter(p => p.status === 'active').length,
    inactive: plugins.filter(p => p.status === 'inactive').length,
    update: plugins.filter(p => p.status === 'update').length,
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      update: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    const labels = {
      active: '已启用',
      inactive: '未启用',
      update: '有更新',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getCategoryLabel = (category) => {
    const labels = {
      auth: '认证',
      analytics: '分析',
      notification: '通知',
      storage: '存储',
      content: '内容',
      marketing: '营销',
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">插件总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已启用</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">未启用</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">待更新</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.update}</p>
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
              <option value="auth">认证</option>
              <option value="analytics">分析</option>
              <option value="notification">通知</option>
              <option value="storage">存储</option>
              <option value="content">内容</option>
              <option value="marketing">营销</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">已启用</option>
              <option value="inactive">未启用</option>
              <option value="update">有更新</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 安装插件
          </button>
        </div>
      </div>

      {/* 插件卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <div key={plugin.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                  {plugin.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{plugin.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getCategoryLabel(plugin.category)} · v{plugin.version}</p>
                </div>
              </div>
              {getStatusBadge(plugin.status)}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{plugin.description}</p>

            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-gray-800 dark:text-white">{plugin.rating}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {plugin.installs} 次安装
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {plugin.author}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                {plugin.status === 'active' ? '配置' : '启用'}
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                详情
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 插件市场推荐 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3">🧩 插件市场</h3>
        <p className="text-sm text-white/80 mb-4">发现更多优质插件，扩展系统功能</p>
        <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors">
          浏览插件市场
        </button>
      </div>
    </div>
  );
};

export default PluginsManagement;
