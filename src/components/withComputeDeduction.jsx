import React, { useState, useEffect } from 'react';
import { computeManager } from '../services/computeService';
import { getFeatureCost, formatPrice } from '../config/computePricing';

const withComputeDeduction = (WrappedComponent, featureType, defaultSubType = 'medium') => {
  return function ComputeWrappedComponent(props) {
    const [user, setUser] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
      setUser(computeManager.getCurrentUser());

      const unsubscribe = computeManager.subscribe(setUser);
      return unsubscribe;
    }, []);

    const getCost = () => {
      const subType = props.subType || defaultSubType;
      return getFeatureCost(featureType, subType);
    };

    const handleExecute = (action) => {
      if (!user) {
        // 未登录，弹出登录提示
        const username = prompt('请先登录，输入用户名：');
        if (username) {
          computeManager.login({ username, avatar: '👤' });
          // 登录后重新执行
          setPendingAction(() => action);
          setShowConfirm(true);
        }
        return;
      }

      setPendingAction(() => action);
      setShowConfirm(true);
    };

    const handleConfirm = async () => {
      const cost = getCost();

      if (user.computePoints < cost) {
        alert(`算力不足！需要 ${cost} 点，当前余额 ${user.computePoints} 点\n\n请先充值后再使用。`);
        setShowConfirm(false);
        return;
      }

      setIsProcessing(true);

      try {
        // 扣除算力
        await computeManager.deductCompute(featureType, props.subType || defaultSubType, {
          featureName: props.featureName || featureType,
        });

        // 执行实际操作
        if (pendingAction) {
          await pendingAction();
        }

        setShowConfirm(false);
      } catch (error) {
        alert(`操作失败: ${error.message}`);
      } finally {
        setIsProcessing(false);
      }
    };

    // 注入处理函数到被包裹组件
    const enhancedProps = {
      ...props,
      onExecute: handleExecute,
      computeCost: getCost(),
      isLoggedIn: !!user,
      userBalance: user?.computePoints || 0,
    };

    return (
      <>
        <WrappedComponent {...enhancedProps} />

        {/* 确认对话框 */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                ⚡ 确认使用此功能
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">消耗算力</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {getCost()} 点
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">当前余额</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {user?.computePoints.toLocaleString() || 0} 点
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">使用后余额</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {(user?.computePoints || 0) - getCost()} 点
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  约等于 {formatPrice(getCost() * 0.01)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? '处理中...' : '确认使用'}
                </button>
              </div>

              {/* 算力不足提示 */}
              {(user?.computePoints || 0) < getCost() && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    算力不足，请先充值
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };
};

export default withComputeDeduction;
