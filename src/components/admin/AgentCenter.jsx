import React, { useState } from 'react';

const AgentCenter = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: '华东代理',
      contact: '张三',
      phone: '138****1234',
      commission: '15%',
      users: 1258,
      revenue: '¥45,600',
      status: 'active',
      joinDate: '2024-06-15',
      avatar: '👔'
    },
    {
      id: 2,
      name: '华南代理',
      contact: '李四',
      phone: '139****5678',
      commission: '12%',
      users: 856,
      revenue: '¥32,400',
      status: 'active',
      joinDate: '2024-08-20',
      avatar: '💼'
    },
    {
      id: 3,
      name: '华北代理',
      contact: '王五',
      phone: '137****9012',
      commission: '10%',
      users: 623,
      revenue: '¥21,800',
      status: 'pending',
      joinDate: '2024-12-10',
      avatar: '🎯'
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredAgents = agents.filter(ag => filter === 'all' || ag.status === filter);

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    pending: agents.filter(a => a.status === 'pending').length,
    totalUsers: agents.reduce((sum, a) => sum + a.users, 0),
    totalRevenue: agents.reduce((sum, a) => sum + parseFloat(a.revenue.replace(/[¥,]/g, '')), 0),
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">活跃</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">审核中</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">代理总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">活跃代理</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">覆盖用户</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">代理营收</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">¥{stats.totalRevenue.toLocaleString()}</p>
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
              <option value="active">活跃</option>
              <option value="pending">审核中</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + 添加代理
          </button>
        </div>
      </div>

      {/* 代理卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-2xl">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{agent.contact}</p>
                </div>
              </div>
              {getStatusBadge(agent.status)}
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">联系电话</span>
                <span className="text-gray-800 dark:text-white">{agent.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">佣金比例</span>
                <span className="text-gray-800 dark:text-white font-medium">{agent.commission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">加入时间</span>
                <span className="text-gray-800 dark:text-white">{agent.joinDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{agent.users}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">用户数</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{agent.revenue}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">营收</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                查看详情
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                编辑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 佣金规则说明 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3">💰 佣金规则</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">基础佣金</p>
            <p className="text-white/80">新用户首单充值 10%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">阶梯佣金</p>
            <p className="text-white/80">月营收超1万提成15%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">持续奖励</p>
            <p className="text-white/80">用户后续消费提成5%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCenter;
