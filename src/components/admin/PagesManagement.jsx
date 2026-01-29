import React, { useState } from 'react';

const PagesManagement = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: '首页',
      slug: '/',
      status: 'published',
      views: 125680,
      author: '系统',
      updatedAt: '2025-01-28 10:00',
      icon: '🏠'
    },
    {
      id: 2,
      title: '产品介绍',
      slug: '/products',
      status: 'published',
      views: 45230,
      author: '张三',
      updatedAt: '2025-01-27 16:30',
      icon: '📦'
    },
    {
      id: 3,
      title: '价格方案',
      slug: '/pricing',
      status: 'published',
      views: 38920,
      author: '李四',
      updatedAt: '2025-01-26 14:20',
      icon: '💰'
    },
    {
      id: 4,
      title: '帮助中心',
      slug: '/help',
      status: 'published',
      views: 28560,
      author: '王五',
      updatedAt: '2025-01-25 11:00',
      icon: '❓'
    },
    {
      id: 5,
      title: '关于我们',
      slug: '/about',
      status: 'draft',
      views: 0,
      author: '赵六',
      updatedAt: '2025-01-24 09:45',
      icon: 'ℹ️'
    },
    {
      id: 6,
      title: '新闻动态',
      slug: '/news',
      status: 'published',
      views: 15670,
      author: '孙七',
      updatedAt: '2025-01-23 15:30',
      icon: '📰'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredPages = pages.filter(p => filter === 'all' || p.status === filter);

  const stats = {
    total: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    draft: pages.filter(p => p.status === 'draft').length,
    totalViews: pages.reduce((sum, p) => sum + p.views, 0),
  };

  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">已发布</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">草稿</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">页面总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已发布</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">草稿</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.draft}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总浏览量</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 新建页面
          </button>
        </div>
      </div>

      {/* 页面卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => (
          <div key={page.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl">
                  {page.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{page.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{page.slug}</p>
                </div>
              </div>
              {getStatusBadge(page.status)}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">作者</span>
                <span className="text-gray-800 dark:text-white">{page.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">浏览量</span>
                <span className="text-gray-800 dark:text-white">{page.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">更新时间</span>
                <span className="text-gray-800 dark:text-white">{page.updatedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                编辑
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                预览
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SEO提示 */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3">🔍 SEO 优化建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">标题优化</p>
            <p className="text-white/80">建议页面标题包含关键词，长度控制在50字符以内</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">描述优化</p>
            <p className="text-white/80">为每个页面设置meta描述，提高搜索引擎收录</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">性能优化</p>
            <p className="text-white/80">优化页面加载速度，提升用户体验和搜索排名</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagesManagement;
