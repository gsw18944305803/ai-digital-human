import React, { useState, useEffect } from 'react';
import { computeManager } from '../services/computeService';
import { COMPUTE_PRICING, formatPrice } from '../config/computePricing';

const ComputeRecharge = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('compute'); // 'compute' or 'membership'
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wechat');

  useEffect(() => {
    setUser(computeManager.getCurrentUser());

    const unsubscribe = computeManager.subscribe(setUser);
    return unsubscribe;
  }, []);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
          <p className="text-center text-gray-600 dark:text-gray-400">请先登录</p>
        </div>
      </div>
    );
  }

  const handleRecharge = () => {
    if (!selectedPackage) {
      alert('请选择充值套餐');
      return;
    }

    if (confirm(`确认充值 ${selectedPackage.amount} 算力，支付 ${formatPrice(selectedPackage.price)}？`)) {
      computeManager.recharge(selectedPackage.amount, selectedPackage.price);
      alert('充值成功！');
      setSelectedPackage(null);
    }
  };

  const handlePurchaseMembership = () => {
    if (!selectedMembership) {
      alert('请选择会员套餐');
      return;
    }

    const membership = COMPUTE_PRICING.membership[selectedMembership];
    if (confirm(`确认购买 ${membership.name}，支付 ${formatPrice(membership.price)}？`)) {
      computeManager.purchaseMembership(selectedMembership);
      alert('购买成功！');
      setSelectedMembership(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">算力充值</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* 当前余额显示 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-6">
            <p className="text-sm opacity-90">当前算力余额</p>
            <p className="text-3xl font-bold">{user.computePoints.toLocaleString()} 点</p>
            <p className="text-sm opacity-90 mt-1">约等于 {formatPrice(user.computePoints * 0.01)}</p>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('compute')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'compute'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              💰 算力充值
            </button>
            <button
              onClick={() => setActiveTab('membership')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'membership'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              👑 会员套餐
            </button>
          </div>

          {/* 算力充值 */}
          {activeTab === 'compute' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">选择充值套餐</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {COMPUTE_PRICING.recharge.map((pkg, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPackage?.amount === pkg.amount
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pkg.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">算力</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mt-2">{formatPrice(pkg.price)}</p>
                      {pkg.amount >= 5000 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {pkg.amount === 5000 ? '9折' : pkg.amount === 10000 ? '85折' : '8折'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 支付方式 */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">支付方式</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'wechat', name: '微信支付', icon: '💬' },
                  { id: 'alipay', name: '支付宝', icon: '💰' },
                  { id: 'balance', name: '余额支付', icon: '🪙' }
                ].map(method => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{method.name}</p>
                  </div>
                ))}
              </div>

              {/* 确认按钮 */}
              <button
                onClick={handleRecharge}
                disabled={!selectedPackage}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {selectedPackage ? `确认充值 ${formatPrice(selectedPackage.price)}` : '请选择套餐'}
              </button>
            </div>
          )}

          {/* 会员套餐 */}
          {activeTab === 'membership' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">选择会员套餐</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(COMPUTE_PRICING.membership).map(([key, membership]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedMembership(key)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMembership === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    } ${key === 'yearly' ? 'relative' : ''}`}
                  >
                    {key === 'yearly' && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        省 ¥2,589
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{membership.name}</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 my-2">
                        {formatPrice(membership.price)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {key === 'lifetime' ? '一次购买，终身使用' : `送 ${membership.compute.toLocaleString()} 算力`}
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>✓ 全部功能解锁</li>
                        <li>✓ 优先客服支持</li>
                        {key === 'lifetime' && <li>✓ 1对1 专属服务</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* 确认按钮 */}
              <button
                onClick={handlePurchaseMembership}
                disabled={!selectedMembership}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {selectedMembership ? `确认购买 ${COMPUTE_PRICING.membership[selectedMembership].name}` : '请选择套餐'}
              </button>
            </div>
          )}

          {/* 说明 */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-2">💡 充值说明</p>
            <ul className="space-y-1 text-xs">
              <li>• 1000算力 = 10元，即1算力 = 0.01元</li>
              <li>• 算力无有效期，永久有效</li>
              <li>• 不同功能消耗不同算力，使用前会显示</li>
              <li>• 如有疑问请联系客服</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComputeRecharge;
