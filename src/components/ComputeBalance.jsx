import React, { useState, useEffect } from 'react';
import { computeManager } from '../services/computeService';
import ComputeRecharge from './ComputeRecharge';

const ComputeBalance = ({ className = '' }) => {
  const [user, setUser] = useState(null);
  const [showRecharge, setShowRecharge] = useState(false);

  useEffect(() => {
    setUser(computeManager.getCurrentUser());

    const unsubscribe = computeManager.subscribe(setUser);
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => {
            const username = prompt('请输入用户名：');
            if (username) {
              computeManager.login({ username, avatar: '👤' });
            }
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          登录
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {/* 算力余额 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white">
          <span className="text-lg">⚡</span>
          <span className="font-bold">{user.computePoints.toLocaleString()}</span>
          <span className="text-xs opacity-90">算力</span>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-lg">{user.avatar}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
            {user.username}
          </span>
        </div>

        {/* 充值按钮 */}
        <button
          onClick={() => setShowRecharge(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + 充值
        </button>
      </div>

      {/* 充值弹窗 */}
      {showRecharge && <ComputeRecharge onClose={() => setShowRecharge(false)} />}
    </>
  );
};

export default ComputeBalance;
