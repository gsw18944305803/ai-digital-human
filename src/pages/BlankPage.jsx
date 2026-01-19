import FranchiseGenerator from '../components/FranchiseGenerator';
import SoraVideoGenerator from '../components/SoraVideoGenerator';
import React from 'react';
import { ChevronLeft, Sparkles, Image as ImageIcon, Search, User, Sliders, Play, Film, Share2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MultiPlatformVideoExtractor from '../components/MultiPlatformVideoExtractor';
import MarketingGenerator from '../components/MarketingGenerator';
import UniversalGenerator from '../components/UniversalGenerator';

const BlankPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const title = searchParams.get('title') || '后端页面';
  const isAIImage = title === 'AI生图' || title === '绘画机器人' || title === 'AI老照片修复' || title === 'AI电商场景图生成' || title === 'AI图片工具箱' || title === 'AI 图片翻译' || title === '证件照生成' || title === 'AI 头像制作' || title === 'AI照片说话' || title === 'AI 红包封面生成' || title === 'AI 换衣' || title === 'AI 矢量图生成' || title === '图片竞技场' || title === 'AI 3D 建模' || title === 'Lora风格创意站' || title === 'ComfyUI工具箱' || title === 'AI绘图提示词专...' || title === 'AI 图像创意站' || title === 'AI 人像创意站';
  const isVideoPipeline = title === '一站式视频创作流水线';
  const isSoraVideo = title === 'Sora2 视频生成';
  const isMultiPlatform = title === '多平台视频数据一键提取';
  const isMarketing = title === '宣传海报、视频制作';
  const isFranchise = title === '招商加盟';
  const isUniversal = title === 'AI翻译大师' || title === 'AI提示词专家' || title === 'AI搜索大师3.0' || title === '网页数据提取工具' || title === 'AI提示词专家2.0' || title === 'AI事实求证' || title === 'AI 卡片生成' || title === 'AI 模型判官' || title === '模型竞技场' || title === 'AI文案助手' || title === 'AI电商文案助手' || title === 'AI文档编辑器' || title === 'AI PPT制作' || title === 'AI 网页总结' || title === 'AI 画图版' || title === 'AI 财讯助手' || title === 'AI Excel' || title === 'AI 简历制作' || title === 'AI 小说写作' || title === 'AI网页生成器' || title === 'AI网页生成器2.0' || title === '代码竞技场' || title === '网页一键部署' || title === 'AI视频素材创意站' || title === 'AI视频生成器' || title === 'AI音视频总结' || title === 'AI视频实时翻译' || title === 'AI视频深度翻译' || title === '视频竞技场' || title === '数字人生生成' || title === 'AI学术论文搜索' || title === 'PDF全能工具箱' || title === 'AI专利搜索' || title === 'AI论文写作' || title === 'AI答题机' || title === 'AI语音生成器' || title === 'AI 音乐制作' || title === 'AI 播客制作' || title === 'AI 语音通话' || title === '语音竞技场';

  return (
    <div className="min-h-screen bg-ai-dark text-white flex flex-col">
      <header className="h-16 border-b border-white/5 flex items-center px-6 bg-ai-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors mr-4"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <h1 className="text-lg font-medium text-white">{title}</h1>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        {isAIImage ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-gray-400">
                输入提示词并上传参考图，选择不同画面比例和模型，快速生成高质量创意图片。
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <section className="bg-ai-card border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                        <ImageIcon size={16} />
                      </span>
                      <div className="text-sm font-medium">参考图片（可选，最多5张）</div>
                    </div>
                    <span className="text-[11px] text-gray-500">支持 JPG/PNG，单张 ≤ 5MB</span>
                  </div>
                  <div className="rounded-xl border border-dashed border-indigo-500/40 bg-ai-dark/40 px-6 py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 text-indigo-400">
                      <Sparkles size={22} />
                    </div>
                    <p className="text-sm text-gray-200 mb-1">拖拽图片到此处，或点击上传</p>
                    <p className="text-xs text-gray-500">智能识别画面内容，不上传也可以生图</p>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-purple-500/15 flex items-center justify-center text-purple-400">
                        <Sparkles size={16} />
                      </span>
                      <div className="text-sm font-medium">补充提示词</div>
                    </div>
                    <button className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/40 hover:bg-purple-500/20">
                      随机提示词
                    </button>
                  </div>
                  <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-4 py-3">
                    <textarea
                      className="w-full bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500 resize-none min-h-[80px]"
                      placeholder="例如：保持主体姿态不变，强化金属质感，并在背景加入霓虹色光效..."
                    />
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-1 h-4 rounded-full bg-indigo-500" />
                    <span>画面比例</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['1:1', '2:3', '3:2', '3:4', '4:5', '5:4', '9:16', '16:9', '21:9'].map(
                      (ratio, index) => (
                        <button
                          key={ratio}
                          className={`h-16 rounded-xl border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                            index === 0
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100 shadow-[0_0_0_1px_rgba(129,140,248,0.4)]'
                              : 'border-white/5 bg-ai-dark/60 text-gray-400 hover:border-indigo-400/70 hover:text-indigo-100'
                          }`}
                        >
                          <span className="inline-flex items-center justify-center rounded-md bg-black/40 w-7 h-4">
                            {ratio === '1:1' ? '■' : '▭'}
                          </span>
                          <span>{ratio}</span>
                        </button>
                      )
                    )}
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-1 h-4 rounded-full bg-purple-500" />
                    <span>生图模型</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {['V1', 'V2', 'V3', 'V4'].map((label, index) => (
                      <button
                        key={label}
                        className={`h-10 rounded-xl text-sm font-medium transition-all border ${
                          index === 0
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/40'
                            : 'bg-ai-dark/60 text-gray-300 border-white/5 hover:border-indigo-400/70 hover:text-white'
                        }`}
                      >
                        {label}
                        {(label === 'V2' || label === 'V4') && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-semibold">
                            4K
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">生成预览</div>
                    <span className="text-xs text-gray-500">生成完成后将在此展示高清预览</span>
                  </div>
                  <div className="flex-1 rounded-xl bg-ai-dark/60 border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 text-sm">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-gray-400">
                      <ImageIcon size={24} />
                    </div>
                    <p>暂未生成图片</p>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="w-1 h-4 rounded-full bg-sky-500" />
                    <span>温馨提示</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-400 leading-relaxed">
                    <li>上传参考图片时建议保持主体清晰、背景简洁，有利于模型理解画面。</li>
                    <li>补充提示词可以指定需要强调或替换的元素，例如材质、光效、风格等。</li>
                    <li>为获得更稳定的效果，可以先使用 1:1 比例与基础模型，再逐步调整参数。</li>
                  </ul>
                </section>
              </div>
            </div>

            <div className="pt-2">
              <button className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center gap-3 hover:from-indigo-400 hover:to-purple-400 transition-all">
                <span>准备生成</span>
                <span className="flex items-center gap-1 text-xs bg-black/20 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>5 点数</span>
                </span>
              </button>
            </div>
          </div>
        ) : isVideoPipeline ? (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold mb-2">一站式视频创作流水线</h2>
                <p className="text-sm text-gray-400">
                  输入关键词，抓取抖音和小红书热门内容，结合用户画像生成个性化文案和视频，并支持一键发布。
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>平台连接正常</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>创作效率提升约 10 倍</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-400">
                        <Search size={16} />
                      </span>
                      <div className="text-sm font-medium">检索关键词与平台</div>
                    </div>
                    <span className="text-[11px] text-gray-500">实时抓取近7天热门内容</span>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-4 py-3 flex items-center gap-3">
                      <Search size={16} className="text-gray-500" />
                      <input
                        className="flex-1 bg-transparent outline-none text-sm text-gray-100 placeholder-gray-500"
                        placeholder="请输入你要创作的主题，例如：职场效率提升、护肤好物分享、健身减脂计划..."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button className="px-3 py-1.5 rounded-full border border-blue-500/60 bg-blue-500/15 text-blue-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        抖音
                      </button>
                      <button className="px-3 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                        小红书
                      </button>
                      <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/60 hover:text-blue-100">
                        同步热门话题
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-xs font-medium text-white hover:bg-blue-400">
                        <Sparkles size={14} />
                        智能检索
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <User size={16} />
                      </span>
                      <div className="text-sm font-medium">创作者画像</div>
                    </div>
                    <span className="text-[11px] text-gray-500">用于精准匹配内容语气与风格</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="text-gray-400">性别</div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          不设置
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          男性
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          女性
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">年龄段</div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          18-24
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          25-34
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          35+
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">行业</div>
                      <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-3 py-2">
                        <select className="w-full bg-transparent text-xs text-gray-100 outline-none">
                          <option className="bg-ai-dark">电商运营</option>
                          <option className="bg-ai-dark">内容博主</option>
                          <option className="bg-ai-dark">本地生活</option>
                          <option className="bg-ai-dark">教育培训</option>
                          <option className="bg-ai-dark">其他行业</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <div className="text-gray-400">人设标签</div>
                      <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-3 py-2">
                        <input
                          className="w-full bg-transparent outline-none text-xs text-gray-100 placeholder-gray-500"
                          placeholder="例如：宝妈创业、职场打工人、专业医生..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">目标受众</div>
                      <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-3 py-2">
                        <input
                          className="w-full bg-transparent outline-none text-xs text-gray-100 placeholder-gray-500"
                          placeholder="例如：年轻女性白领、小镇青年、大学生..."
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-purple-500/15 flex items-center justify-center text-purple-400">
                        <Sliders size={16} />
                      </span>
                      <div className="text-sm font-medium">创作风格与视频参数</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="text-gray-400">文案风格</div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          干货教学
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          真实种草
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          故事共鸣
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-gray-400">视频时长</div>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          15 秒
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          30 秒
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-blue-400/70 hover:text-blue-100">
                          60 秒
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-xs font-medium text-white shadow-lg shadow-purple-500/40 hover:from-purple-400 hover:to-blue-400">
                      <Sparkles size={14} />
                      生成文案与视频方案
                    </button>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-400">
                        <Film size={16} />
                      </span>
                      <div className="text-sm font-medium">平台热门内容参考</div>
                    </div>
                    <span className="text-[11px] text-gray-500">根据关键词实时抓取</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 rounded-xl bg-ai-dark/40 border border-white/5 px-3 py-3">
                      <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-300 text-[11px]">
                        小红书
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-100 line-clamp-1">
                            3 个小习惯，让你的职场效率翻倍提升
                          </p>
                          <span className="text-[11px] text-gray-500 ml-2">近7天 · 2.3w赞</span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          从早起规划、番茄工作法到复盘笔记，手把手教你搭建高效工作流。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-ai-dark/40 border border-white/5 px-3 py-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 text-[11px]">
                        抖音
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-100 line-clamp-1">
                            打工人下班后的 3 个自救方式
                          </p>
                          <span className="text-[11px] text-gray-500 ml-2">近7天 · 5.1w赞</span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          通过真实故事切入，让观众产生情绪共鸣，评论区自然开始主动互动。
                        </p>
                      </div>
                    </div>
                    <button className="w-full mt-1 text-[11px] text-blue-300 hover:text-blue-200 text-left">
                      查看更多参考内容
                    </button>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-purple-500/15 flex items-center justify-center text-purple-400">
                        <Sparkles size={16} />
                      </span>
                      <div className="text-sm font-medium">AI 生成的脚本与分镜</div>
                    </div>
                    <span className="text-[11px] text-gray-500">可直接用于拍摄或全程 AI 生成</span>
                  </div>
                  <div className="rounded-xl bg-ai-dark/40 border border-white/5 px-4 py-3 space-y-2 text-xs text-gray-200">
                    <p className="text-[11px] text-gray-500">开场 0-3 秒</p>
                    <p className="leading-relaxed">
                      画面快速切入忙碌的办公场景，字幕文案：「下班之后，你还在被工作追着跑吗？」
                    </p>
                    <p className="text-[11px] text-gray-500 pt-2">中段 3-20 秒</p>
                    <p className="leading-relaxed">
                      镜头切换到创作者本人，边操作边讲解 3 个提升效率的小习惯，并在关键节点打上重点提示。
                    </p>
                    <p className="text-[11px] text-gray-500 pt-2">结尾 20-30 秒</p>
                    <p className="leading-relaxed">
                      用一句有记忆点的金句收尾，并引导用户点赞收藏：「把这条视频收藏起来，下次崩溃的时候翻出来用。」 
                    </p>
                  </div>
                </section>

                <section className="bg-ai-card border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <Play size={16} />
                      </span>
                      <div className="text-sm font-medium">视频预览与一键发布</div>
                    </div>
                    <span className="text-[11px] text-gray-500">当前为模拟预览，接入账号后即可真实发布</span>
                  </div>
                  <div className="rounded-xl bg-ai-dark/60 border border-dashed border-white/10 h-40 flex items-center justify-center text-xs text-gray-500 flex-col gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
                      <Play size={20} />
                    </div>
                    <p>视频预览区域，生成后可在此播放检查节奏与文案</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>发布平台</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-full border border-pink-500/60 bg-pink-500/15 text-pink-200 text-[11px]">
                          小红书
                        </button>
                        <button className="px-3 py-1.5 rounded-full border border-blue-500/60 bg-blue-500/15 text-blue-200 text-[11px]">
                          抖音
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300 hover:border-gray-400/70 hover:text-white">
                        重新生成方案
                      </button>
                      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-xs font-medium text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-400 hover:to-blue-400">
                        <Share2 size={14} />
                        一键发布
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : isSoraVideo ? (
          <SoraVideoGenerator />
        ) : isMultiPlatform ? (
          <MultiPlatformVideoExtractor />
        ) : isMarketing ? (
          <MarketingGenerator />
        ) : isFranchise ? (
          <FranchiseGenerator />
        ) : isUniversal ? (
          <UniversalGenerator title={title} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            页面内容空白
          </div>
        )}
      </main>
    </div>
  );
};

export default BlankPage;
