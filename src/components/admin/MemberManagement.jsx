import React, { useState } from 'react';

const MemberManagement = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      username: '张三',
      level: 'yearly',
      status: 'active',
      balance: 5200,
      totalSpent: 999,
      joinDate: '2024-06-15',
      expireDate: '2025-06-15',
      avatar: '👤',
      lastActive: '2025-01-28 10:30'
    },
    {
      id: 2,
      username: '李四',
      level: 'monthly',
      status: 'active',
      balance: 1200,
      totalSpent: 598,
      joinDate: '2024-11-20',
      expireDate: '2025-02-20',
      avatar: '👤',
      lastActive: '2025-01-28 09:15'
    },
    {
      id: 3,
      username: '王五',
      level: 'lifetime',
      status: 'active',
      balance: 9999,
      totalSpent: 2999,
      joinDate: '2024-01-10',
      expireDate: '永久',
      avatar: '👤',
      lastActive: '2025-01-28 08:00'
    },
    {
      id: 4,
      username: '赵六',
      level: 'monthly',
      status: 'expired',
      balance: 0,
      totalSpent: 299,
      joinDate: '2024-11-01',
      expireDate: '2024-12-01',
      avatar: '👤',
      lastActive: '2024-11-28 16:45'
    },
    {
      id: 5,
      username: '孙七',
      level: 'yearly',
      status: 'active',
      balance: 8500,
      totalSpent: 999,
      joinDate: '2024-08-15',
      expireDate: '2025-08-15',
      avatar: '👤',
      lastActive: '2025-01-27 14:20'
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member => {
    const matchesStatus = filter === 'all' || member.status === filter;
    const matchesLevel = levelFilter === 'all' || member.level === levelFilter;
    const matchesSearch = member.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesLevel && matchesSearch;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    lifetime: members.filter(m => m.level === 'lifetime').length,
    totalRevenue: members.reduce((sum, m) => sum + m.totalSpent, 0),
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">活跃</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">已过期</span>;
  };

  const getLevelBadge = (level) => {
    const styles = {
      lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      yearly: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      monthly: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    const labels = {
      lifetime: '永久会员',
      yearly: '年费会员',
      monthly: '月费会员',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">会员总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">活跃会员</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">永久会员</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lifetime}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已过期</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总营收</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">¥{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* 会员套餐卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <h3 className="text-lg font-bold mb-2">月费会员</h3>
          <p className="text-3xl font-bold mb-1">¥299<span className="text-lg font-normal">/月</span></p>
          <ul className="text-sm space-y-1 mt-3 text-blue-100">
            <li>• 1000 算力/月</li>
            <li>• 基础功能解锁</li>
            <li>• 优先客服支持</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <h3 className="text-lg font-bold mb-2">年费会员</h3>
          <p className="text-3xl font-bold mb-1">¥999<span className="text-lg font-normal">/年</span></p>
          <p className="text-sm text-purple-200 mb-3">省 ¥2,589</p>
          <ul className="text-sm space-y-1 text-purple-100">
            <li>• 12000 算力/年</li>
            <li>• 全部功能解锁</li>
            <li>• 专属客服支持</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 text-white">
          <h3 className="text-lg font-bold mb-2">永久会员</h3>
          <p className="text-3xl font-bold mb-1">¥2999<span className="text-lg font-normal">/永久</span></p>
          <p className="text-sm text-yellow-100 mb-3">一次购买，终身使用</p>
          <ul className="text-sm space-y-1 text-yellow-100">
            <li>• 50000 算力</li>
            <li>• 全部功能解锁</li>
            <li>• 1对1 专属服务</li>
          </ul>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="搜索用户名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部等级</option>
              <option value="lifetime">永久会员</option>
              <option value="yearly">年费会员</option>
              <option value="monthly">月费会员</option>
            </select>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="expired">已过期</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 添加会员
          </button>
        </div>
      </div>

      {/* 会员列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">会员等级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">算力余额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">累计消费</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">到期时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">最后活跃</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                        {member.avatar}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">{member.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getLevelBadge(member.level)}</td>
                  <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                  <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">{member.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">¥{member.totalSpent}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{member.expireDate}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{member.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="充值">
                        💰
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="延期">
                        📅
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="升级">
                        ⬆️
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

export default MemberManagement;
