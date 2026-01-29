import React, { useState, useEffect } from 'react';
import { computeManager } from '../services/computeService';
import { formatPrice } from '../config/computePricing';

const ComputeHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const user = computeManager.getCurrentUser();
    if (!user) {
      alert('请先登录');
      return;
    }

    setHistory(user.usageHistory || []);
    setStats({
      totalRecharge: user.totalRecharge,
      totalConsumed: user.totalConsumed,
      currentBalance: user.computePoints,
      membership: user.membership,
    });
  };

  const getFeatureName = (record) => {
    if (record.type === 'recharge') return '算力充值';
    if (record.type === 'membership') return `购买会员: ${record.membershipType}`;
    return record.featureName || record.featureType || '未知功能';
  };

  const getRecordBadge = (record) => {
    if (record.type === 'recharge') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">充值</span>;
    }
    if (record.type === 'membership') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">会员</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">消费</span>;
  };

  const filteredHistory = history.filter(record => {
    if (filter === 'all') return true;
    if (filter === 'recharge') return record.type === 'recharge' || record.type === 'membership';
    if (filter === 'consume') return record.featureType;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">当前余额</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.currentBalance.toLocaleString()}</p>
            <p className="text-xs text-gray-400">约等于 {formatPrice(stats.currentBalance * 0.01)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">累计充值</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(stats.totalRecharge)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">累计消费</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalConsumed.toLocaleString()} 点</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">会员等级</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.membership === 'lifetime' ? '永久' : stats.membership === 'yearly' ? '年费' : stats.membership === 'monthly' ? '月费' : '普通'}
            </p>
          </div>
        </div>
      )}

      {/* 筛选 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">筛选:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('consume')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'consume' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            消费记录
          </button>
          <button
            onClick={() => setFilter('recharge')}
            className={`px-3 py-1 rounded-lg text-sm ${filter === 'recharge' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          >
            充值记录
          </button>
          <button
            onClick={loadData}
            className="ml-auto px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 记录列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">功能</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">算力</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    暂无记录
                  </td>
                </tr>
              ) : (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">{getRecordBadge(record)}</td>
                    <td className="px-6 py-4 text-gray-800 dark:text-white">{getFeatureName(record)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        record.type === 'recharge' || record.type === 'membership'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {record.type === 'recharge' || record.type === 'membership'
                          ? `+${record.amount || record.compute || 0}`
                          : `-${record.cost || 0}`
                        } 点
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 功能消耗说明 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3">💡 算力消耗说明</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-2">
            <p className="font-medium">AI写作</p>
            <p className="text-white/80">10-50点/次</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <p className="font-medium">Sora视频</p>
            <p className="text-white/80">500-1200点/次</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <p className="font-medium">声音克隆</p>
            <p className="text-white/80">5-30点/次</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <p className="font-medium">AI绘画</p>
            <p className="text-white/80">50-100点/张</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeHistory;
