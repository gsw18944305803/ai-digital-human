import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemConfig } from '../hooks/useSystemConfig';
import SystemConfig from '../components/admin/SystemConfig';
import UserManagement from '../components/admin/UserManagement';
import SoraManagement from '../components/admin/SoraManagement';
import WorkflowManagement from '../components/admin/WorkflowManagement';
import AvatarManagement from '../components/admin/AvatarManagement';
import VoiceCloningManagement from '../components/admin/VoiceCloningManagement';
import VideoChannelManagement from '../components/admin/VideoChannelManagement';
import AgentCenter from '../components/admin/AgentCenter';
import WorksManagement from '../components/admin/WorksManagement';
import OrdersManagement from '../components/admin/OrdersManagement';
import MemberManagement from '../components/admin/MemberManagement';
import PagesManagement from '../components/admin/PagesManagement';
import PluginsManagement from '../components/admin/PluginsManagement';
import AppsManagement from '../components/admin/AppsManagement';

// 仪表盘概览组件
const DashboardOverview = () => {
  const config = useSystemConfig();
  const [stats, setStats] = useState({
    totalUsers: 1258,
    dailyActive: 342,
    totalCalls: 15420,
    systemHealth: 98,
    serverLoad: 45,
    memoryUsage: 32,
    totalRevenue: 302,
    memberRevenue: 302,
    totalMembers: 60,
    activeMembers: 15,
    computeConsumption: 249300,
    agents: 2
  });
  const [featureUsage, setFeatureUsage] = useState([]);
  const [logs, setLogs] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    // 模拟实时数据波动
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        serverLoad: Math.min(100, Math.max(10, prev.serverLoad + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(100, Math.max(20, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        dailyActive: prev.dailyActive + (Math.random() > 0.8 ? 1 : 0),
        totalCalls: prev.totalCalls + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0)
      }));

      // 模拟日志
      if (Math.random() > 0.7) {
        const actions = ['API Call', 'User Login', 'Image Gen', 'Video Render', 'Data Sync', 'SORA生成', 'AI生图', '语音克隆', '形象分身'];
        const status = ['Success', 'Success', 'Success', 'Pending', 'Processing'];
        const newLog = {
            time: new Date().toLocaleTimeString(),
            action: actions[Math.floor(Math.random() * actions.length)],
            status: status[Math.floor(Math.random() * status.length)]
        };
        setLogs(prev => [newLog, ...prev].slice(0, 8));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 获取真实用户数据
    const savedUsers = localStorage.getItem('admin_users');
    let realTotalUsers = 0;
    let usersList = [];
    if (savedUsers) {
      try {
        usersList = JSON.parse(savedUsers);
        realTotalUsers = usersList.length;
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }

    // 获取真实配置数据
    if (config) {
      const modelsCount = Object.keys(config.models || {}).length;
      const featuresCount = Object.keys(config.features || {}).length;

      // 计算真实服务健康度
      const allServices = [
        ...Object.entries(config.models || {}).map(([k, v]) => ({ name: v.name || k, key: k, type: 'model', config: v })),
        ...Object.entries(config.features || {}).map(([k, v]) => ({ name: k, key: k, type: 'feature', config: v })),
      ];

      const configured = allServices.filter(s => s.config.apiKey || s.config.apiToken);

      const healthPercentage = allServices.length > 0 ? Math.round((configured.length / allServices.length) * 100) : 100;

      // 生成Top用户列表（模拟数据）
      const topUsersData = [
        { rank: 1, username: 'Zoe', compute: 50000, avatar: '👤' },
        { rank: 2, username: '微信用户', compute: 25850, avatar: '👤' },
        { rank: 3, username: '酥香阁电商', compute: 11610, avatar: '🏪' },
        { rank: 4, username: '沈亚庆', compute: 11600, avatar: '👔' },
        { rank: 5, username: '小周文绉绉', compute: 10870, avatar: '👩' },
        { rank: 6, username: '南通Lan Live', compute: 10220, avatar: '🎭' },
        { rank: 7, username: 'Hyman', compute: 10110, avatar: '🎨' },
        { rank: 8, username: '土豆泥', compute: 10100, avatar: '🥔' },
        { rank: 9, username: '酥香阁助理', compute: 10000, avatar: '📋' },
        { rank: 10, username: '黄金炒饭', compute: 10000, avatar: '🍚' },
      ];
      setTopUsers(topUsersData);

      // 更新统计状态
      setStats(prev => ({
        ...prev,
        totalUsers: realTotalUsers || prev.totalUsers,
        systemHealth: healthPercentage
      }));

      // 生成功能列表
      const featuresList = [
        ...Object.keys(config.models || {}).map(k => ({ name: config.models[k].name, count: Math.floor(Math.random() * 1000) })),
        ...Object.keys(config.features || {}).map(k => ({ name: k, count: Math.floor(Math.random() * 500) })),
      ].sort((a, b) => b.count - a.count);

      setFeatureUsage(featuresList.slice(0, 10));
    }
  }, [config]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 核心运营数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm mb-2 opacity-90">总收入</p>
              <h3 className="text-2xl font-bold mb-1">¥{stats.totalRevenue.toFixed(2)}</h3>
              <p className="text-xs text-blue-200">↑ 85% 周环比</p>
            </div>
            <div className="text-3xl opacity-20">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm mb-2 opacity-90">会员+算力收入</p>
              <h3 className="text-2xl font-bold mb-1">¥{stats.memberRevenue.toFixed(2)}</h3>
              <p className="text-xs text-purple-200">↑ 78% 周环比</p>
            </div>
            <div className="text-3xl opacity-20">💎</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm mb-2 opacity-90">累计会员</p>
              <h3 className="text-2xl font-bold mb-1">{stats.totalMembers}</h3>
              <p className="text-xs text-green-200">↑ 100% 周环比</p>
            </div>
            <div className="text-3xl opacity-20">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm mb-2 opacity-90">活跃消费会员</p>
              <h3 className="text-2xl font-bold mb-1">{stats.activeMembers}</h3>
              <p className="text-xs text-orange-200">↑ 65% 周环比</p>
            </div>
            <div className="text-3xl opacity-20">⭐</div>
          </div>
        </div>
      </div>

      {/* 第二行数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">算力消费</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{(stats.computeConsumption / 1000).toFixed(1)}k</h3>
              <p className="text-xs text-gray-400">¥{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">总用户数</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalUsers}</h3>
              <p className="text-xs text-green-500">↑ {Math.floor(stats.dailyActive * 1.2)} 本周新增</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">API调用总量</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.totalCalls.toLocaleString()}</h3>
              <p className="text-xs text-gray-400">+{Math.floor(Math.random() * 100)} 今日</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">代理总数</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.agents}</h3>
              <p className="text-xs text-gray-400">+0 新增</p>
            </div>
            <div className="text-2xl">🤝</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI资产统计 */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📊</span>
              AI资产统计
            </h4>
          </div>
          <div className="p-5">
            {/* Tab切换 */}
            <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
              <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium">SORA视频</button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">声音模板</button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">形象分身</button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">合成视频</button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">工作流</button>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">594</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">总数</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">16</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">运行中</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">463</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">已完成</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">115</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">失败</p>
              </div>
            </div>

            {/* 热门功能Top10 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-semibold text-gray-700 dark:text-gray-300">热门功能 Top10</h5>
                <select className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <option>算力总量 Top10</option>
                  <option>算力消耗 Top10</option>
                  <option>充值金额 Top10</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">排名</th>
                      <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">用户</th>
                      <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">算力消费</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user) => (
                      <tr key={user.rank} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-3 py-3">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${user.rank <= 3 ? 'bg-yellow-400 text-yellow-900' : user.rank <= 10 ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-500'}`}>
                            {user.rank}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{user.avatar}</span>
                            <span className="text-gray-800 dark:text-gray-200">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400">{user.compute.toLocaleString()} GPUh</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 系统状态 & 日志 */}
        <div className="space-y-6">
          {/* 系统状态 */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold flex items-center gap-2">🖥️ 系统状态</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">运行正常</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">CPU 负载</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{Math.round(stats.serverLoad)}%</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${stats.serverLoad > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${stats.serverLoad}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">内存使用</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{Math.round(stats.memoryUsage)}%</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{width: `${stats.memoryUsage}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">实时响应</span>
                <span className="text-sm font-mono text-green-400">24ms</span>
              </div>
            </div>
          </div>

          {/* 系统日志 */}
          <div className="bg-slate-900 text-gray-300 rounded-xl p-5 shadow-sm">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">📜 系统日志</h4>
            <div className="space-y-2 font-mono text-xs max-h-[200px] overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center gap-3 pb-2 border-b border-slate-700 last:border-0">
                  <span className="text-slate-500">{log.time}</span>
                  <span className={`flex-1 ${log.status === 'Success' ? 'text-green-400' : log.status === 'Processing' ? 'text-blue-400' : 'text-yellow-400'}`}>
                    [{log.status.toUpperCase()}] {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主管理面板组件
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [userInfo, setUserInfo] = useState({
    username: 'boguan_admin',
    avatar: '👤',
    computePoints: 184640
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const handleLogout = () => {
    if (window.confirm('确定要退出管理员登录吗？')) {
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: '首页' },
    { id: 'users', icon: '👥', label: '用户管理' },
    { id: 'sora', icon: '🎬', label: 'Sora管理' },
    { id: 'workflow', icon: '⚡', label: '工作流' },
    { id: 'avatar', icon: '👤', label: '形象分身' },
    { id: 'voice', icon: '🎤', label: '声音克隆' },
    { id: 'video', icon: '🎥', label: '视频通道' },
    { id: 'agent', icon: '🤝', label: '代理中心' },
    { id: 'works', icon: '🎨', label: '作品管理' },
    { id: 'orders', icon: '📦', label: '后台订单' },
    { id: 'member', icon: '💎', label: '会员' },
    { id: 'pages', icon: '📄', label: '页面' },
    { id: 'plugins', icon: '🔌', label: '插件' },
    { id: 'apps', icon: '🚀', label: '应用' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-900 dark:bg-gray-950 text-white flex flex-col fixed h-full z-50">
        {/* Logo区域 */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <div>
              <h1 className="font-bold text-lg">超级管理员</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI数字人系统</p>
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {userInfo.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userInfo.username}</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 底部退出按钮 */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
          >
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-64">
        {/* 顶部栏 */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {activeView === 'dashboard' && '🏠 首页'}
                {activeView === 'users' && '👥 用户管理'}
                {activeView === 'config' && '⚙️ 设置'}
                {activeView === 'sora' && '🎬 Sora管理'}
                {activeView === 'workflow' && '⚡ 工作流'}
                {activeView === 'avatar' && '👤 形象分身'}
                {activeView === 'voice' && '🎤 声音克隆'}
                {activeView === 'video' && '🎥 视频通道'}
                {activeView === 'agent' && '🤝 代理中心'}
                {activeView === 'works' && '🎨 作品管理'}
                {activeView === 'orders' && '📦 后台订单'}
                {activeView === 'member' && '💎 会员管理'}
                {activeView === 'pages' && '📄 页面管理'}
                {activeView === 'plugins' && '🔌 插件管理'}
                {activeView === 'apps' && '🚀 应用管理'}
              </h2>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>公告</span>
                <span>•</span>
                <span>当前版本：1.1.5</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                🔄
              </button>

              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {userInfo.avatar}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userInfo.username}</span>
                <button className="text-gray-400 hover:text-gray-600">✏️</button>
              </div>

              <div className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <span>🌟</span>
                <span>算力：{(userInfo.computePoints / 1000).toFixed(1)}k</span>
              </div>

              <button className="text-gray-400 hover:text-red-500 text-xl">🚪</button>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="p-6">
          {activeView === 'dashboard' && <DashboardOverview />}
          {activeView === 'users' && <UserManagement />}
          {activeView === 'config' && <SystemConfig />}
          {activeView === 'sora' && <SoraManagement />}
          {activeView === 'workflow' && <WorkflowManagement />}
          {activeView === 'avatar' && <AvatarManagement />}
          {activeView === 'voice' && <VoiceCloningManagement />}
          {activeView === 'video' && <VideoChannelManagement />}
          {activeView === 'agent' && <AgentCenter />}
          {activeView === 'works' && <WorksManagement />}
          {activeView === 'orders' && <OrdersManagement />}
          {activeView === 'member' && <MemberManagement />}
          {activeView === 'pages' && <PagesManagement />}
          {activeView === 'plugins' && <PluginsManagement />}
          {activeView === 'apps' && <AppsManagement />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
