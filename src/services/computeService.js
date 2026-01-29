import { getFeatureCost, formatPrice } from '../config/computePricing';

const STORAGE_KEY = 'user_compute_data';
const SESSION_KEY = 'user_session';

// 用户数据结构
const createUserData = (userId) => ({
  userId,
  username: '',
  avatar: '',
  computePoints: 1000, // 初始算力
  totalRecharge: 0,
  totalConsumed: 0,
  membership: null, // null, 'monthly', 'yearly', 'lifetime'
  membershipExpire: null,
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  usageHistory: [], // 使用记录
});

// 算力管理类
class ComputeManager {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    this.init();
  }

  // 初始化
  init() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      this.currentUser = JSON.parse(session);
    }
  }

  // 订阅算力变化
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 通知所有订阅者
  notify() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  // 保存到存储
  save() {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 获取算力余额
  getBalance() {
    return this.currentUser?.computePoints || 0;
  }

  // 检查是否已登录
  isLoggedIn() {
    return !!this.currentUser;
  }

  // 用户登录/注册
  login(userData) {
    let existingData = localStorage.getItem(STORAGE_KEY);
    let user;

    if (existingData) {
      user = JSON.parse(existingData);
    } else {
      user = createUserData(userData.id || 'user_' + Date.now());
    }

    // 更新用户信息
    user.username = userData.username || user.username;
    user.avatar = userData.avatar || user.avatar;
    user.lastActiveAt = new Date().toISOString();

    this.currentUser = user;
    this.save();
    return user;
  }

  // 用户退出
  logout() {
    this.currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  // 检查算力是否足够
  checkBalance(required) {
    const balance = this.getBalance();
    return balance >= required;
  }

  // 扣除算力
  async deductCompute(featureType, subType = 'medium', metadata = {}) {
    if (!this.isLoggedIn()) {
      throw new Error('请先登录');
    }

    const cost = getFeatureCost(featureType, subType);

    if (!this.checkBalance(cost)) {
      throw new Error(`算力不足，需要${cost}点，当前余额${this.getBalance()}点`);
    }

    // 扣除算力
    this.currentUser.computePoints -= cost;
    this.currentUser.totalConsumed += cost;
    this.currentUser.lastActiveAt = new Date().toISOString();

    // 记录使用历史
    const record = {
      id: Date.now(),
      featureType,
      subType,
      cost,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.currentUser.usageHistory.unshift(record);

    // 只保留最近1000���记录
    if (this.currentUser.usageHistory.length > 1000) {
      this.currentUser.usageHistory = this.currentUser.usageHistory.slice(0, 1000);
    }

    this.save();

    return {
      success: true,
      remainingBalance: this.currentUser.computePoints,
      cost,
      record
    };
  }

  // 充值算力
  recharge(amount, price) {
    if (!this.isLoggedIn()) {
      throw new Error('请先登录');
    }

    this.currentUser.computePoints += amount;
    this.currentUser.totalRecharge += price;
    this.currentUser.lastActiveAt = new Date().toISOString();

    // 记录充值
    const record = {
      id: Date.now(),
      type: 'recharge',
      amount,
      price,
      timestamp: new Date().toISOString()
    };

    this.currentUser.usageHistory.unshift(record);
    this.save();

    return {
      success: true,
      newBalance: this.currentUser.computePoints
    };
  }

  // 购买会员
  purchaseMembership(membershipType) {
    if (!this.isLoggedIn()) {
      throw new Error('请先登录');
    }

    const membershipConfig = {
      monthly: { compute: 1000, price: 299, duration: 30 },
      yearly: { compute: 12000, price: 999, duration: 365 },
      lifetime: { compute: 50000, price: 2999, duration: null }
    };

    const config = membershipConfig[membershipType];
    if (!config) {
      throw new Error('无效的会员类型');
    }

    this.currentUser.computePoints += config.compute;
    this.currentUser.totalRecharge += config.price;
    this.currentUser.membership = membershipType;

    if (config.duration) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + config.duration);
      this.currentUser.membershipExpire = expireDate.toISOString();
    } else {
      this.currentUser.membershipExpire = null;
    }

    this.currentUser.lastActiveAt = new Date().toISOString();

    // 记录购买
    const record = {
      id: Date.now(),
      type: 'membership',
      membershipType,
      compute: config.compute,
      price: config.price,
      timestamp: new Date().toISOString()
    };

    this.currentUser.usageHistory.unshift(record);
    this.save();

    return {
      success: true,
      newBalance: this.currentUser.computePoints,
      membership: membershipType,
      expireDate: this.currentUser.membershipExpire
    };
  }

  // 获取使用历史
  getUsageHistory(limit = 50) {
    if (!this.isLoggedIn()) {
      return [];
    }
    return this.currentUser.usageHistory.slice(0, limit);
  }

  // 获取使用统计
  getUsageStats() {
    if (!this.isLoggedIn()) {
      return null;
    }

    const stats = {
      totalRecharge: this.currentUser.totalRecharge,
      totalConsumed: this.currentUser.totalConsumed,
      currentBalance: this.currentUser.computePoints,
      membership: this.currentUser.membership,
      membershipExpire: this.currentUser.membershipExpire,
    };

    // 按功能类型统计
    const featureStats = {};
    this.currentUser.usageHistory.forEach(record => {
      if (record.featureType) {
        if (!featureStats[record.featureType]) {
          featureStats[record.featureType] = {
            count: 0,
            totalCost: 0
          };
        }
        featureStats[record.featureType].count++;
        featureStats[record.featureType].totalCost += record.cost;
      }
    });

    stats.featureStats = featureStats;
    return stats;
  }
}

// 导出单例
export const computeManager = new ComputeManager();

// 便捷Hook
export function useCompute() {
  const [user, setUser] = React.useState(() => computeManager.getCurrentUser());

  React.useEffect(() => {
    return computeManager.subscribe(setUser);
  }, []);

  return {
    user,
    balance: user?.computePoints || 0,
    isLoggedIn: !!user,
    login: computeManager.login.bind(computeManager),
    logout: computeManager.logout.bind(computeManager),
    deduct: computeManager.deductCompute.bind(computeManager),
    recharge: computeManager.recharge.bind(computeManager),
    purchaseMembership: computeManager.purchaseMembership.bind(computeManager),
    getHistory: computeManager.getUsageHistory.bind(computeManager),
    getStats: computeManager.getUsageStats.bind(computeManager),
  };
}

// React hook 需要在文件顶部导入 React
import React from 'react';
