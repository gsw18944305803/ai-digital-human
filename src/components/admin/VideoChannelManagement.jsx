import React, { useState } from 'react';

const VideoChannelManagement = () => {
  const [channels, setChannels] = useState([
    {
      id: 1,
      name: '抖音官方号',
      platform: 'douyin',
      status: 'connected',
      followers: '125.8万',
      videos: 234,
      avgViews: '5.2万',
      lastPost: '2025-01-28 10:00',
      icon: '📱'
    },
    {
      id: 2,
      name: '快手主账号',
      platform: 'kuaishou',
      status: 'connected',
      followers: '89.2万',
      videos: 187,
      avgViews: '3.8万',
      lastPost: '2025-01-28 09:30',
      icon: '📲'
    },
    {
      id: 3,
      name: '视频号',
      platform: 'weixin',
      status: 'disconnected',
      followers: '45.6万',
      videos: 123,
      avgViews: '2.1万',
      lastPost: '2025-01-27 18:00',
      icon: '💬'
    },
    {
      id: 4,
      name: 'B站官方',
      platform: 'bilibili',
      status: 'connected',
      followers: '32.4万',
      videos: 156,
      avgViews: '1.5万',
      lastPost: '2025-01-27 20:00',
      icon: '📺'
    },
    {
      id: 5,
      name: '小红书',
      platform: 'xiaohongshu',
      status: 'error',
      followers: '28.9万',
      videos: 98,
      avgViews: '9000',
      lastPost: '2025-01-26 15:00',
      icon: '📕'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredChannels = channels.filter(ch => filter === 'all' || ch.status === filter);

  const stats = {
    total: channels.length,
    connected: channels.filter(c => c.status === 'connected').length,
    disconnected: channels.filter(c => c.status === 'disconnected').length,
    error: channels.filter(c => c.status === 'error').length,
    totalFollowers: '321.9万',
    totalVideos: channels.reduce((sum, c) => sum + c.videos, 0),
  };

  const getStatusBadge = (status) => {
    const styles = {
      connected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const labels = {
      connected: '已连接',
      disconnected: '未连接',
      error: '连接异常',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPlatformName = (platform) => {
    const names = {
      douyin: '抖音',
      kuaishou: '快手',
      weixin: '微信视频号',
      bilibili: 'B站',
      xiaohongshu: '小红书',
    };
    return names[platform] || platform;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">通道总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已连接</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.connected}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">未连接</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.disconnected}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总粉丝数</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalFollowers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总视频数</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalVideos}</p>
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
              <option value="connected">已连接</option>
              <option value="disconnected">未连接</option>
              <option value="error">连接异常</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 添加通道
          </button>
        </div>
      </div>

      {/* 通道卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => (
          <div key={channel.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  {channel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{channel.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getPlatformName(channel.platform)}</p>
                </div>
              </div>
              {getStatusBadge(channel.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{channel.followers}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">粉丝数</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{channel.videos}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">视频数</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{channel.avgViews}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">平均播放</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">最近</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{channel.lastPost.split(' ')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                管理
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                发布
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoChannelManagement;
