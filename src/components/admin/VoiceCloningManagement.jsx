import React, { useState } from 'react';

const VoiceCloningManagement = () => {
  const [voices, setVoices] = useState([
    {
      id: 1,
      name: '新闻播报音',
      category: '新闻',
      language: '中文',
      gender: '女',
      duration: '2小时',
      status: 'completed',
      quality: '高',
      usage: 3456,
      createdAt: '2025-01-20',
      icon: '🎙️'
    },
    {
      id: 2,
      name: '商务解说音',
      category: '商务',
      language: '中文',
      gender: '男',
      duration: '1.5小时',
      status: 'completed',
      quality: '中',
      usage: 1234,
      createdAt: '2025-01-18',
      icon: '🎤'
    },
    {
      id: 3,
      name: '客服温柔音',
      category: '客服',
      language: '中文',
      gender: '女',
      duration: '3小时',
      status: 'training',
      quality: '高',
      usage: 0,
      createdAt: '2025-01-28',
      icon: '🗣️'
    },
    {
      id: 4,
      name: '英语教学音',
      category: '教育',
      language: '英语',
      gender: '女',
      duration: '4小时',
      status: 'completed',
      quality: '高',
      usage: 5678,
      createdAt: '2025-01-10',
      icon: '📚'
    },
    {
      id: 5,
      name: '广告促销音',
      category: '广告',
      language: '中文',
      gender: '男',
      duration: '1小时',
      status: 'failed',
      quality: '-',
      usage: 0,
      createdAt: '2025-01-25',
      icon: '📢'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredVoices = voices.filter(v => filter === 'all' || v.status === filter);

  const stats = {
    total: voices.length,
    completed: voices.filter(v => v.status === 'completed').length,
    training: voices.filter(v => v.status === 'training').length,
    failed: voices.filter(v => v.status === 'failed').length,
    totalUsage: voices.reduce((sum, v) => sum + v.usage, 0),
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      training: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      completed: '已完成',
      training: '训练中',
      failed: '失败',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getQualityBadge = (quality) => {
    if (quality === '高') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">高</span>;
    }
    if (quality === '中') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">中</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">-</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">声音总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已完成</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">训练中</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.training}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">失败</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
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
              <option value="completed">已完成</option>
              <option value="training">训练中</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 克隆新声音
          </button>
        </div>
      </div>

      {/* 声音列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">声音</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">类别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">语言/性别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">时长</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">质量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">使用次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVoices.map((voice) => (
                <tr key={voice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                        {voice.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{voice.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{voice.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{voice.category}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{voice.language} / {voice.gender}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{voice.duration}</td>
                  <td className="px-6 py-4">{getStatusBadge(voice.status)}</td>
                  <td className="px-6 py-4">{getQualityBadge(voice.quality)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{voice.usage.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="试听">
                        🔊
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="编辑">
                        ✏️
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

export default VoiceCloningManagement;
