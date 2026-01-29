import { useState, useCallback } from 'react';
import { computeManager } from '../services/computeService';
import { getFeatureCost, formatPrice } from '../config/computePricing';

/**
 * 算力使用 Hook
 * 用于功能组件中处理算力扣除逻辑
 *
 * @param {string} featureType - 功能类型
 * @param {string} defaultSubType - 默认子类型
 * @returns {Object} 算力相关状态和方法
 */
export function useCompute(featureType, defaultSubType = 'medium') {
  const [user, setUser] = useState(() => computeManager.getCurrentUser());
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取算力消耗
  const getCost = useCallback((subType) => {
    return getFeatureCost(featureType, subType || defaultSubType);
  }, [featureType, defaultSubType]);

  // 检查是否登录
  const checkLogin = useCallback(() => {
    return !!user;
  }, [user]);

  // 检查算力是否足够
  const checkBalance = useCallback((required) => {
    const balance = user?.computePoints || 0;
    return balance >= required;
  }, [user]);

  // 获取当前余额
  const getBalance = useCallback(() => {
    return user?.computePoints || 0;
  }, [user]);

  // 执行需要算力的操作
  const executeWithCompute = useCallback(async (action, subType = null) => {
    const cost = getCost(subType);

    // 检查登录
    if (!user) {
      // 未登录，弹出登录提示
      const username = prompt('请先登录，输入用户名：');
      if (username) {
        const loggedInUser = computeManager.login({ username, avatar: '👤' });
        setUser(loggedInUser);
        // 登录后继续
        setPendingAction(() => action);
        setShowConfirm(true);
      }
      return { success: false, reason: 'not_logged_in' };
    }

    // 检查算力
    if (!checkBalance(cost)) {
      const shouldRecharge = confirm(
        `算力不足！\n\n需要：${cost} 点\n当前余额：${getBalance()} 点\n约等于：${formatPrice(cost * 0.01)}\n\n是否立即充值？`
      );
      if (shouldRecharge) {
        // 触发充值（这里需要配合充值组件使用）
        window.dispatchEvent(new CustomEvent('open-recharge-modal'));
      }
      return { success: false, reason: 'insufficient_balance', required: cost, balance: getBalance() };
    }

    // 显示确认对话框
    setPendingAction(() => action);
    setShowConfirm(true);

    return { success: true, pending: true };
  }, [user, getCost, checkBalance, getBalance]);

  // 确认执行
  const confirmExecute = useCallback(async () => {
    const cost = getCost();
    setIsProcessing(true);

    try {
      // 先扣除算力
      const result = await computeManager.deductCompute(featureType, defaultSubType, {
        featureName: featureType,
      });

      // 执行实际操作
      if (pendingAction) {
        await pendingAction();
      }

      setShowConfirm(false);
      setIsProcessing(false);

      return {
        success: true,
        remainingBalance: result.remainingBalance,
        cost: result.cost
      };
    } catch (error) {
      setIsProcessing(false);
      alert(`操作失败: ${error.message}`);
      return { success: false, error: error.message };
    }
  }, [featureType, defaultSubType, getCost, pendingAction]);

  // 取消执行
  const cancelExecute = useCallback(() => {
    setShowConfirm(false);
    setPendingAction(null);
  }, []);

  return {
    // 状态
    user,
    isLoggedIn: !!user,
    balance: getBalance(),
    showConfirm,
    isProcessing,
    cost: getCost(),

    // 方法
    executeWithCompute,
    confirmExecute,
    cancelExecute,
    checkLogin,
    checkBalance,
    getCost,
    getBalance,

    // 计算相关
    formatPrice: (points) => formatPrice(points),
  };
}

/**
 * 算力消耗提示组件
 */
export function ComputeCostDisplay({ featureType, subType, className = '' }) {
  const cost = getFeatureCost(featureType, subType);
  const price = formatPrice(cost * 0.01);

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className="text-yellow-600 dark:text-yellow-400">⚡</span>
      <span className="text-gray-600 dark:text-gray-400">消耗算力: </span>
      <span className="font-semibold text-blue-600 dark:text-blue-400">{cost} 点</span>
      <span className="text-gray-400">({price})</span>
    </div>
  );
}

/**
 * 算力确认对话框组件
 */
export function ComputeConfirmDialog({ isOpen, onClose, onConfirm, cost, balance, isProcessing }) {
  if (!isOpen) return null;

  const remainingBalance = balance - cost;
  const isInsufficient = balance < cost;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          ⚡ 确认使用此功能
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">消耗算力</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {cost} 点
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">当前余额</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {balance.toLocaleString()} 点
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">使用后余额</span>
            <span className={`font-semibold ${remainingBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
              {remainingBalance < 0 ? 0 : remainingBalance.toLocaleString()} 点
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            约等于 {formatPrice(cost * 0.01)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || isInsufficient}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '处理中...' : '确认使用'}
          </button>
        </div>

        {isInsufficient && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              算力不足，请先充值
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 导出辅助函数
export { getFeatureCost, formatPrice };
