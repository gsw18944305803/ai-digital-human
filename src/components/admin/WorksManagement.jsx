import React, { useState } from 'react';

const WorksManagement = () => {
  const [works, setWorks] = useState([
    {
      id: 1,
      title: 'AI生成视频-产品宣传',
      type: 'video',
      author: '张三',
      status: 'published',
      views: 12580,
      likes: 856,
      comments: 123,
      createdAt: '2025-01-28 10:30',
      thumbnail: '🎬'
    },
    {
      id: 2,
      title: '智能配音-教程讲解',
      type: 'audio',
      author: '李四',
      status: 'published',
      views: 8920,
      likes: 523,
      comments: 67,
      createdAt: '2025-01-28 09:15',
      thumbnail: '🎙️'
    },
    {
      id: 3,
      title: '数字人直播录像',
      type: 'avatar',
      author: '王五',
      status: 'reviewing',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2025-01-28 08:00',
      thumbnail: '👤'
    },
    {
      id: 4,
      title: 'AI文章-产品介绍',
      type: 'text',
      author: '赵六',
      status: 'published',
      views: 3450,
      likes: 234,
      comments: 45,
      createdAt: '2025-01-27 16:45',
      thumbnail: '📝'
    },
    {
      id: 5,
      title: '多语言翻译视频',
      type: 'video',
      author: '孙七',
      status: 'rejected',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: '2025-01-27 14:20',
      thumbnail: '🌍'
    },
    {
      id: 6,
      title: 'AI绘画作品集',
      type: 'image',
      author: '周八',
      status: 'published',
      views: 23450,
      likes: 1567,
      comments: 234,
      createdAt: '2025-01-27 11:00',
      thumbnail: '🎨'
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorks = works.filter(work => {
    const matchesStatus = filter === 'all' || work.status === filter;
    const matchesType = typeFilter === 'all' || work.type === typeFilter;
    const matchesSearch = work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         work.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: works.length,
    published: works.filter(w => w.status === 'published').length,
    reviewing: works.filter(w => w.status === 'reviewing').length,
    rejected: works.filter(w => w.status === 'rejected').length,
    totalViews: works.reduce((sum, w) => sum + w.views, 0),
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      reviewing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      published: '已发布',
      reviewing: '审核中',
      rejected: '已拒绝',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      video: '视频',
      audio: '音频',
      avatar: '数字人',
      text: '文章',
      image: '图片',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">作品总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已发布</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">审核中</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.reviewing}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已拒绝</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
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
            <input
              type="text"
              placeholder="搜索作品或作者..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="video">视频</option>
              <option value="audio">音频</option>
              <option value="avatar">数字人</option>
              <option value="text">文章</option>
              <option value="image">图片</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="reviewing">审核中</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            批量审核
          </button>
        </div>
      </div>

      {/* 作品列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">作品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">作者</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">数据</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorks.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                        {work.thumbnail}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white max-w-xs truncate">{work.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{getTypeLabel(work.type)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{work.author}</td>
                  <td className="px-6 py-4">{getStatusBadge(work.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400">
                      <span>👁 {work.views.toLocaleString()}</span>
                      <span>❤️ {work.likes} 💬 {work.comments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{work.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="查看">
                        👁️
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="审核">
                        ✅
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="删除">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorksManagement;
