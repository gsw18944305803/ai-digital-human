import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Filter, MoreVertical, Shield, Crown, User, Key, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    inviteCode: '',
    role: 'user',
    permissions: [],
    status: 'active',
    computePoints: 0,
    memberLevel: 'free'
  });

  // 模拟初始化数据
  useEffect(() => {
    const savedUsers = localStorage.getItem('admin_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const initialUsers = [
        { id: 1, username: 'boguan_admin', password: 'boguan_admin', inviteCode: 'VIP888', role: 'admin', permissions: ['read', 'write', 'delete', 'manage_ai', 'manage_layout'], status: 'active', computePoints: 184640, memberLevel: 'premium', createdAt: '2024-01-15' },
        { id: 2, username: 'test_user', password: '123456', inviteCode: 'TEST001', role: 'user', permissions: ['read'], status: 'active', computePoints: 5000, memberLevel: 'free', createdAt: '2024-01-20' },
        { id: 3, username: 'Zoe', password: '123456', inviteCode: 'VIP001', role: 'user', permissions: ['read', 'write'], status: 'active', computePoints: 50000, memberLevel: 'premium', createdAt: '2024-01-18' },
        { id: 4, username: 'editor_user', password: '123456', inviteCode: 'EDIT001', role: 'editor', permissions: ['read', 'write'], status: 'active', computePoints: 15000, memberLevel: 'standard', createdAt: '2024-01-22' },
        { id: 5, username: 'suspended_user', password: '123456', inviteCode: 'SUSP001', role: 'user', permissions: ['read'], status: 'disabled', computePoints: 0, memberLevel: 'free', createdAt: '2024-01-25' },
      ];
      setUsers(initialUsers);
      localStorage.setItem('admin_users', JSON.stringify(initialUsers));
    }
  }, []);

  // 保存数据到 localStorage
  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('admin_users', JSON.stringify(newUsers));
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', inviteCode: '', role: 'user', permissions: [], status: 'active', computePoints: 0, memberLevel: 'free' });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('确定要删除此用户吗？此操作不可恢复！')) {
      const newUsers = users.filter(u => u.id !== id);
      saveUsers(newUsers);
    }
  };

  const handleToggleStatus = (id) => {
    const newUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'active' ? 'disabled' : 'active' };
      }
      return u;
    });
    saveUsers(newUsers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      const newUsers = users.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u);
      saveUsers(newUsers);
    } else {
      const newUser = { ...formData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
      saveUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.inviteCode && user.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 统计数据
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admin: users.filter(u => u.role === 'admin').length,
    premium: users.filter(u => u.memberLevel === 'premium').length,
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: Crown, label: '超级管理员' },
      editor: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Edit, label: '编辑' },
      user: { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-400', icon: User, label: '普通用户' },
    };
    const badge = badges[role] || badges.user;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <CheckCircle size={12} />
          活跃
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        <XCircle size={12} />
        禁用
      </span>
    );
  };

  const getMemberBadge = (level) => {
    const badges = {
      premium: { color: 'from-yellow-500 to-orange-500', label: 'Premium', icon: '👑' },
      standard: { color: 'from-blue-500 to-cyan-500', label: 'Standard', icon: '⭐' },
      free: { color: 'from-gray-500 to-gray-600', label: 'Free', icon: '👤' },
    };
    const badge = badges[level] || badges.free;
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${badge.color} text-white`}>
        <span>{badge.icon}</span>
        {badge.label}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">总用户数</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">活跃用户</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.active}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">管理员</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.admin}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">高级会员</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.premium}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Crown size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 头部操作栏 */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">用户账号管理</h3>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} />
              添加用户
            </button>
          </div>

          {/* 搜索和过滤 */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名或邀请码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有角色</option>
              <option value="admin">超级管理员</option>
              <option value="editor">编辑</option>
              <option value="user">普通用户</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有状态</option>
              <option value="active">活跃</option>
              <option value="disabled">禁用</option>
            </select>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">用户信息</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">角色 & 等级</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">算力</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">邀请码</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">创建时间</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无符合条件的用户
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        {getRoleBadge(user.role)}
                        {getMemberBadge(user.memberLevel)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <DollarSign size={14} />
                        <span className="font-mono font-medium">{(user.computePoints / 1000).toFixed(1)}k</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Key size={14} className="text-gray-400" />
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                          {user.inviteCode || '-'}
                        </code>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {user.createdAt || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                          title={user.status === 'active' ? '禁用用户' : '启用用户'}
                        >
                          {user.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="编辑用户"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="删除用户"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>显示 {filteredUsers.length} 条记录</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                上一页
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 添加/编辑用户模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* 模态框头部 */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingUser ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  {editingUser ? (
                    <Edit size={20} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Plus size={20} className="text-green-600 dark:text-green-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingUser ? '编辑用户' : '添加用户'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 模态框内容 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 用户名 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <User size={14} />
                    用户名
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="请输入用户名"
                  required
                />
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Key size={14} />
                    密码
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "留空则不修改密码" : "请输入初始密码"}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={!editingUser}
                />
              </div>

              {/* 邀请码 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Shield size={14} />
                    邀请码 (登录验证用)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.inviteCode || ''}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                  placeholder="例如: VIP888"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  required
                />
              </div>

              {/* 角色选择 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="flex items-center gap-2">
                    <Shield size={14} />
                    角色类型
                  </span>
                </label>
                <div className="space-y-2">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'user', permissions: ['read'], memberLevel: 'free' })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'user'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === 'user' ? 'border-blue-500' : 'border-gray-300'}`}>
                          {formData.role === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-white">普通用户</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">仅用于前台网站登录，拥有基础使用权限</p>
                        </div>
                      </div>
                      <span className="text-2xl">👤</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'editor', permissions: ['read', 'write'], memberLevel: 'standard' })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'editor'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === 'editor' ? 'border-purple-500' : 'border-gray-300'}`}>
                          {formData.role === 'editor' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-white">编辑</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">可以创建和编辑内容</p>
                        </div>
                      </div>
                      <span className="text-2xl">✏️</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, role: 'admin', permissions: ['read', 'write', 'delete', 'manage_ai', 'manage_layout'], memberLevel: 'premium' })}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === 'admin'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === 'admin' ? 'border-yellow-500' : 'border-gray-300'}`}>
                          {formData.role === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-white">超级管理员</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">拥有后台所有管理权限</p>
                        </div>
                      </div>
                      <span className="text-2xl">👑</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 状态选择 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  状态
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'active' })}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.status === 'active'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <CheckCircle size={18} />
                    活跃
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'disabled' })}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.status === 'disabled'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <XCircle size={18} />
                    禁用
                  </button>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Save size={18} />
                  {editingUser ? '保存修改' : '创建用户'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
