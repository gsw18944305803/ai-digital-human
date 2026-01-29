import React, { useState } from 'react';

const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: '视频生成流程',
      description: 'AI视频自动生成与发布',
      status: 'active',
      nodes: 5,
      executions: 1234,
      lastRun: '2025-01-28 10:30',
      icon: '🎬'
    },
    {
      id: 2,
      name: '内容审核流程',
      description: '自动审核用户生成内容',
      status: 'active',
      nodes: 3,
      executions: 5678,
      lastRun: '2025-01-28 10:25',
      icon: '🔍'
    },
    {
      id: 3,
      name: '数据分析流程',
      description: '用户行为数据收集与分析',
      status: 'paused',
      nodes: 7,
      executions: 890,
      lastRun: '2025-01-27 18:00',
      icon: '📊'
    },
    {
      id: 4,
      name: '通知推送流程',
      description: '系统通知与消息推送',
      status: 'active',
      nodes: 4,
      executions: 3456,
      lastRun: '2025-01-28 10:20',
      icon: '🔔'
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filteredWorkflows = workflows.filter(wf => filter === 'all' || wf.status === filter);

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.executions, 0),
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">运行中</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">已暂停</span>;
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">工作流总数</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">运行中</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">已暂停</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.paused}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">总执行次数</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalExecutions.toLocaleString()}</p>
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
              <option value="active">运行中</option>
              <option value="paused">已暂停</option>
            </select>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + 新建工作流
          </button>
        </div>
      </div>

      {/* 工作流卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                  {workflow.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{workflow.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
                </div>
              </div>
              {getStatusBadge(workflow.status)}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{workflow.nodes}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">节点数</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{workflow.executions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">执行次数</p>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm font-medium text-gray-800 dark:text-white">今日</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{workflow.lastRun}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                编辑
              </button>
              <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                执行记录
              </button>
              <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 rounded-lg transition-colors">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新建工作流模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">新建工作流</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">工作流名称</label>
                <input
                  type="text"
                  placeholder="输入工作流名称"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                <textarea
                  placeholder="输入工作流描述"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;
