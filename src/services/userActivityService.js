/**
 * 用户行为追踪服务
 * 用于记录用户的使用行为，为用户画像提供数据支持
 */

const STORAGE_KEYS = {
  ACTIVITIES: 'user_activities',
  LAST_SUMMARY_DATE: 'user_last_summary_date',
  USER_PROFILE: 'user_profile'
};

class UserActivityService {
  /**
   * 记录用户行为
   * @param {string} featureName - 功能名称
   * @param {string} action - 动作类型 (generate, optimize, navigate等)
   * @param {object} metadata - 额外元数据
   */
  trackActivity(featureName, action, metadata = {}) {
    const activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      featureName,
      action,
      metadata
    };

    const activities = this.getActivities();
    activities.push(activity);

    // 只保留最近90天的数据
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const filteredActivities = activities.filter(
      a => new Date(a.timestamp) > ninetyDaysAgo
    );

    // 限制存储大小，最多保留1000条记录
    const limitedActivities = filteredActivities.slice(-1000);

    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(limitedActivities));

    console.log('📊 用户行为已记录:', activity);
  }

  /**
   * 获取所有行为记录
   */
  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('读取用户行为失败:', e);
      return [];
    }
  }

  /**
   * 获取今天的行为记录
   */
  getTodayActivities() {
    const activities = this.getActivities();
    const today = new Date().toDateString();

    return activities.filter(a => {
      const activityDate = new Date(a.timestamp).toDateString();
      return activityDate === today;
    });
  }

  /**
   * 获取最近N天的行为记录
   */
  getRecentActivities(days = 7) {
    const activities = this.getActivities();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return activities.filter(a => new Date(a.timestamp) > cutoffDate);
  }

  /**
   * 获取上次生成总结的日期
   */
  getLastSummaryDate() {
    return localStorage.getItem(STORAGE_KEYS.LAST_SUMMARY_DATE);
  }

  /**
   * 设置上次生成总结的日期
   */
  setLastSummaryDate(date) {
    localStorage.setItem(STORAGE_KEYS.LAST_SUMMARY_DATE, date);
  }

  /**
   * 检查是否需要生成每日总结
   */
  shouldGenerateDailySummary() {
    const lastSummary = this.getLastSummaryDate();
    const today = new Date().toDateString();

    if (!lastSummary) return true;
    return lastSummary !== today;
  }

  /**
   * 保存用户画像
   */
  saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({
      ...profile,
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * 获取用户画像
   */
  getUserProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('读取用户画像失败:', e);
      return null;
    }
  }

  /**
   * 获取功能使用频率统计
   */
  getFeatureUsageStats(days = 7) {
    const activities = this.getRecentActivities(days);
    const stats = {};

    activities.forEach(a => {
      if (!stats[a.featureName]) {
        stats[a.featureName] = {
          count: 0,
          lastUsed: null,
          actions: {}
        };
      }
      stats[a.featureName].count++;

      if (!stats[a.featureName].lastUsed ||
          new Date(a.timestamp) > new Date(stats[a.featureName].lastUsed)) {
        stats[a.featureName].lastUsed = a.timestamp;
      }

      if (!stats[a.featureName].actions[a.action]) {
        stats[a.featureName].actions[a.action] = 0;
      }
      stats[a.featureName].actions[a.action]++;
    });

    return stats;
  }

  /**
   * 获取用户行为摘要（用于LLM分析）
   */
  getActivitySummaryForAnalysis(days = 7) {
    const activities = this.getRecentActivities(days);
    const stats = this.getFeatureUsageStats(days);

    // 按日期分组
    const byDate = {};
    activities.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString('zh-CN');
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push({
        feature: a.featureName,
        action: a.action,
        time: new Date(a.timestamp).toLocaleTimeString('zh-CN')
      });
    });

    // 获取高频功能
    const topFeatures = Object.entries(stats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([name, data]) => ({
        name,
        count: data.count,
        actions: Object.keys(data.actions)
      }));

    return {
      period: `${days}天`,
      totalActivities: activities.length,
      topFeatures,
      dailyBreakdown: byDate,
      activities: activities.slice(-50) // 最近50条详细记录
    };
  }

  /**
   * 清除所有数据
   */
  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.LAST_SUMMARY_DATE);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  }
}

// 导出单例
export const userActivityService = new UserActivityService();

// 导出便捷方法
export const trackActivity = (featureName, action, metadata) => {
  userActivityService.trackActivity(featureName, action, metadata);
};

// 别名导出，保持向后兼容
export const trackUserActivity = trackActivity;

export const getUserProfile = () => {
  return userActivityService.getUserProfile();
};

export const shouldGenerateDailySummary = () => {
  return userActivityService.shouldGenerateDailySummary();
};

export const getActivitySummaryForAnalysis = (days = 7) => {
  return userActivityService.getActivitySummaryForAnalysis(days);
};

export const saveUserProfile = (profile) => {
  userActivityService.saveUserProfile(profile);
};

export default userActivityService;
