import React, { useState } from 'react';

const AvatarManagement = () => {
  const [avatars, setAvatars] = useState([
    {
      id: 1,
      name: '主持人小艾',
      gender: '女',
      age: '25岁',
      style: '商务风格',
      status: 'active',
      usage: 1234,
      image: '👩‍💼',
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      name: '讲师老王',
      gender: '男',
      age: '40岁',
      style: '学术风格',
      status: 'active',
      usage: 856,
      image: '👨‍🏫',
      createdAt: '2025-01-10'
    },
    {
      id: 3,
      name: '客服小美',
      gender: '女',
      age: '22岁',
      style: '亲和风格',
      status: 'active',
      usage: 2341,
      image: '👩',
      createdAt: '2025-01-08'
    },
    {
      id: 4,
      name: '新闻主播',
      gender: '女',
      age: '30岁',
      style: '专业风格',
      status: 'inactive',
      usage: 567,
      image: '🎤',
      createdAt: '2025-01-05'
    },
    {
      id: 5,
      name: '科技解说员',
      gender: '男',
      age: '35岁',
      style: '科技风格',
      status: 'training',
      usage: 0,
      image: '👨‍💻',
      createdAt: '2025-01-28'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredAvatars = avatars.filter(av => filter === 'all' || av.status === filter);

  const stats = {
    total: avatars.length,
    active: avatars.filter(a => a.status === 'active').length,
    training: avatars.filter(a => a.status === 'training').length,
    totalUsage: avatars.reduce((sum, a) => sum + a.usage, 0),
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      training: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    const labels = {
      active: '使用中',
      inactive: '已停用',
      training: '训练中',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">形象总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">使用中</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">训练中</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.training}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总使用次数</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalUsage.toLocaleString()}</p>
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
              <option value="active">使用中</option>
              <option value="inactive">已停用</option>
              <option value="training">训练中</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 训练新形象
          </button>
        </div>
      </div>

      {/* 形象卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAvatars.map((avatar) => (
          <div key={avatar.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl">
              {avatar.image}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-white">{avatar.name}</h3>
                {getStatusBadge(avatar.status)}
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <p>性别: {avatar.gender} | 年龄: {avatar.age}</p>
                <p>风格: {avatar.style}</p>
                <p>创建时间: {avatar.createdAt}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">使用 {avatar.usage} 次</span>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    ✏️
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarManagement;
