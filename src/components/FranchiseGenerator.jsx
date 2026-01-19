import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Target, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Download, 
  Share2, 
  BarChart3,
  Loader2,
  PieChart,
  Briefcase
} from 'lucide-react';

const FranchiseGenerator = () => {
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [budget, setBudget] = useState('10-30万');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    if (!brandName || !industry) return;
    setIsGenerating(true);
    
    // Simulate API generation
    setTimeout(() => {
      setResult({
        summary: `基于${industry}行业大数据分析，${brandName}品牌具有极高的市场潜力。建议采用“直营+加盟”混合模式快速扩张。`,
        roi: '12-18个月',
        profit: '25% - 35%',
        marketSize: '2.5万亿',
        coreAdvantages: [
          '标准化运营体系，零经验轻松上手',
          '独家供应链渠道，成本低于行业15%',
          '全媒体矩阵引流，不仅是开店更是网红打卡地',
          '保姆式开业扶持，选址装修培训一站式服务'
        ],
        supportPlan: [
          { title: '选址评估', desc: '大数据商圈分析，精准锁定目标客群' },
          { title: '装修设计', desc: '统一VI视觉识别系统，打造品牌调性' },
          { title: '运营培训', desc: '店长/员工标准化培训，定期督导巡店' },
          { title: '营销推广', desc: '开业活动策划，线上线下全渠道曝光' }
        ]
      });
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-white flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <TrendingUp size={20} />
          </span>
          招商加盟方案生成
        </h2>
        <p className="text-gray-400 max-w-2xl">
          一键生成专业的招商加盟策划书与ROI分析报表。输入品牌基础信息，AI 助您快速构建商业扩张蓝图。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-ai-card border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Briefcase size={18} className="text-green-400" />
              品牌基础信息
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">品牌名称</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="例如：茶颜悦色"
                  className="w-full bg-ai-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">所属行业</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-ai-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>请选择行业赛道</option>
                  <option value="餐饮美食">餐饮美食</option>
                  <option value="零售百货">零售百货</option>
                  <option value="教育培训">教育培训</option>
                  <option value="生活服务">生活服务</option>
                  <option value="休闲娱乐">休闲娱乐</option>
                  <option value="美容美体">美容美体</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">单店投资预算</label>
                <div className="grid grid-cols-2 gap-3">
                  {['10万以内', '10-30万', '30-50万', '50万以上'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBudget(opt)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        budget === opt
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !brandName || !industry}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isGenerating || !brandName || !industry
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25 hover:scale-[1.02]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      正在生成方案...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      生成招商方案
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats (Static/Mock) */}
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/10 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                <Target size={24} />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">精准获客建议</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  建议优先布局二线城市核心商圈，通过抖音本地生活引流，预计获客成本可降低 40%。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Result Dashboard */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* 1. Key Metrics Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-ai-card border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign size={48} />
                  </div>
                  <div className="text-sm text-gray-400 mb-1">预计回本周期</div>
                  <div className="text-2xl font-bold text-green-400">{result.roi}</div>
                </div>
                <div className="bg-ai-card border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BarChart3 size={48} />
                  </div>
                  <div className="text-sm text-gray-400 mb-1">综合毛利率</div>
                  <div className="text-2xl font-bold text-blue-400">{result.profit}</div>
                </div>
                <div className="bg-ai-card border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-all">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <PieChart size={48} />
                  </div>
                  <div className="text-sm text-gray-400 mb-1">潜在市场规模</div>
                  <div className="text-2xl font-bold text-purple-400">{result.marketSize}</div>
                </div>
              </div>

              {/* 2. Analysis Content */}
              <div className="bg-ai-card border border-white/5 rounded-2xl p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 border-l-4 border-green-500 pl-3">市场分析摘要</h3>
                  <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                    {result.summary}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-l-4 border-blue-500 pl-3">核心竞争优势</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.coreAdvantages.map((adv, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                        <span className="text-gray-300 text-sm">{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 border-l-4 border-purple-500 pl-3">全方位扶持政策</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.supportPlan.map((plan, i) => (
                      <div key={i} className="bg-ai-dark/40 rounded-xl p-4 text-center border border-white/5 hover:bg-white/5 transition-colors">
                        <div className="text-green-400 font-medium mb-1">{plan.title}</div>
                        <div className="text-xs text-gray-500">{plan.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                  <Download size={18} />
                  下载完整招商手册 (PDF)
                </button>
                <button className="px-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  分享方案
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-ai-card border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Building2 size={32} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-400">暂无方案数据</p>
                <p className="text-sm mt-1">请在左侧填写品牌信息并点击生成</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FranchiseGenerator;
