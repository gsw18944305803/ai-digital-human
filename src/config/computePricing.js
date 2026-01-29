// 算力定价配置
// 1000算力 = 10元，即1算力 = 0.01元 = 1分钱

export const COMPUTE_PRICING = {
  // 基础配置
  baseRate: 0.01, // 1算力 = 0.01元

  // 各功能算力消耗配置
  features: {
    // AI写作 - 基于GPT模型
    writing: {
      short: 10,      // 短文生成 (约500字)
      medium: 25,     // 中等篇幅 (约1000字)
      long: 50,       // 长文生成 (约2000字)
      custom: 5,      // 按千字计算
    },

    // SORA视频生成 - 视频生成成本较高
    sora: {
      short: 500,     // 短视频 15秒
      medium: 800,    // 中等视频 30秒
      long: 1200,     // 长视频 60秒
      custom: 40,     // 按秒计算
    },

    // 形象分身
    avatar: {
      train: 3000,    // 训练新形象 (一次性)
      use: 100,       // 使用已训练形象/秒
      preview: 20,    // 预览
    },

    // 声音克隆
    voice: {
      clone: 2000,    // 克隆新声音 (约1小时样本)
      tts: {
        short: 5,     // 短文本 <100字
        medium: 15,   // 中等文本 100-500字
        long: 30,     // 长文本 >500字
        custom: 3,    // 按百字计算
      },
    },

    // AI绘画
    image: {
      standard: 50,   // 标准质量
      hd: 100,        // 高清
      custom: 30,     // 自定义尺寸
    },

    // 视频翻译
    videoTranslate: {
      short: 100,     // 短视频 <1分钟
      medium: 200,    // 中等视频 1-5分钟
      long: 500,      // 长视频 >5分钟
    },

    // PPT生成
    ppt: {
      simple: 30,     // 简单PPT <10页
      standard: 60,   // 标准PPT 10-20页
      complex: 100,   // 复杂PPT >20页
    },

    // 文章提取/总结
    extractArticle: {
      short: 5,       // 短文章
      medium: 10,     // 中等文章
      long: 20,       // 长文章
    },

    // 提示词优化
    promptOptimize: {
      basic: 10,      // 基础优化
      advanced: 25,   // 高级优化
    },

    // 营销文案生成
    marketing: {
      short: 15,      // 短文案
      medium: 30,     // 中等文案
      long: 50,       // 长文案
    },

    // 卡片生成
    card: {
      basic: 20,      // 基础卡片
      advanced: 40,   // 高级卡片
    },

    // 学术搜索
    academic: {
      search: 5,      // 搜索
      analyze: 15,    // 分析
    },

    // AI对话
    chat: {
      message: 3,     // 按条计算
      context: 5,     // 带上下文
    },

    // 批量视频制作
    batchVideo: {
      perVideo: 300,  // 每个视频
    },

    // AI短剧编辑
    shortDrama: {
      perScene: 50,   // 每个场景
    },

    // 实时热点
    trends: {
      search: 3,      // 搜索
      analyze: 10,    // 分析
    },

    // 优惠券生成
    coupon: {
      basic: 5,       // 基础
      custom: 15,     // 自定义
    },

    // 爬虫功能
    crawler: {
      basic: 10,      // 基础爬取
      advanced: 30,   // 高级爬取
    },
  },

  // 会员套餐配置
  membership: {
    monthly: {
      price: 299,
      compute: 1000,
      name: '月费会员'
    },
    yearly: {
      price: 999,
      compute: 12000,
      name: '年费会员'
    },
    lifetime: {
      price: 2999,
      compute: 50000,
      name: '永久会员'
    }
  },

  // 算力充值套餐
  recharge: [
    { amount: 100, price: 1 },      // 100算力 = 1元
    { amount: 500, price: 5 },      // 500算力 = 5元
    { amount: 1000, price: 10 },    // 1000算力 = 10元
    { amount: 5000, price: 45 },    // 5000算力 = 45元 (9折)
    { amount: 10000, price: 85 },   // 10000算力 = 85元 (85折)
    { amount: 50000, price: 400 },  // 50000算力 = 400元 (8折)
  ],
};

// 计算算力价格
export function calculatePrice(computePoints) {
  return computePoints * COMPUTE_PRICING.baseRate;
}

// 获取功能算力消耗
export function getFeatureCost(featureType, subType = 'medium') {
  const feature = COMPUTE_PRICING.features[featureType];
  if (!feature) return 10; // 默认10算力

  if (typeof feature === 'object') {
    return feature[subType] || feature.medium || 10;
  }
  return feature;
}

// 格式化价格显示
export function formatPrice(price) {
  return `¥${price.toFixed(2)}`;
}
