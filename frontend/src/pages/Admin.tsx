import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Shield, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { Breadcrumb, SearchBar, FilterChip } from '../components/UIPatterns';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  teams: string[];
  createdAt?: string;
}

const Admin: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'alice@org.com',
      name: 'Alice Johnson',
      role: 'ml-engineer',
      status: 'active',
      teams: ['Data', 'Models'],
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      email: 'bob@org.com',
      name: 'Bob Smith',
      role: 'data-engineer',
      status: 'active',
      teams: ['Data'],
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      email: 'carol@org.com',
      name: 'Carol Davis',
      role: 'model-sponsor',
      status: 'active',
      teams: ['Stakeholders'],
      createdAt: '2024-01-03',
    },
    {
      id: '4',
      email: 'diana@org.com',
      name: 'Diana Wilson',
      role: 'admin',
      status: 'active',
      teams: ['Admin'],
      createdAt: '2024-01-04',
    },
    {
      id: '5',
      email: 'evan@org.com',
      name: 'Evan Martinez',
      role: 'ml-engineer',
      status: 'pending',
      teams: [],
      createdAt: '2024-01-20',
    },
    {
      id: '6',
      email: 'fiona@org.com',
      name: 'Fiona Chen',
      role: 'data-scientist',
      status: 'pending',
      teams: [],
      createdAt: '2024-01-21',
    },
  ]);

  const roles = [
    { id: 'ml-engineer', name: 'ML Engineer', permissions: ['create_pipelines', 'register_models', 'deploy_to_dev'] },
    { id: 'data-engineer', name: 'Data Engineer', permissions: ['ingest_data', 'prepare_data', 'create_features'] },
    { id: 'data-scientist', name: 'Data Scientist', permissions: ['analyze_data', 'explore_features'] },
    { id: 'prod-team', name: 'Production Team', permissions: ['deploy_to_staging', 'deploy_to_prod', 'approve_promotion'] },
    { id: 'monitoring-team', name: 'Monitoring Team', permissions: ['view_monitoring', 'create_alerts', 'acknowledge_alerts'] },
    { id: 'model-sponsor', name: 'Model Sponsor', permissions: ['view_dashboards', 'view_models'] },
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
  ];

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'ml-engineer' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  const handleAddUser = () => {
    const user: User = {
      id: (users.length + 1).toString(),
      ...newUser,
      status: 'active',
      teams: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, user]);
    setShowUserModal(false);
    setNewUser({ email: '', name: '', role: 'ml-engineer' });
    showNotification('User added successfully', 'success');
  };

  const handleApproveUser = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: 'active' } : u
    ));
    showNotification('User approved and activated', 'success');
  };

  const handleRejectUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    showNotification('User rejected and removed', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    showNotification('User deleted', 'success');
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ml-engineer': 'bg-blue-600/20 text-blue-400',
      'data-engineer': 'bg-green-600/20 text-green-400',
      'prod-team': 'bg-red-600/20 text-red-400',
      'monitoring-team': 'bg-yellow-600/20 text-yellow-400',
      'model-sponsor': 'bg-purple-600/20 text-purple-400',
      'admin': 'bg-pink-600/20 text-pink-400',
    };
    return colors[role] || 'bg-gray-600/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Administration' }]} />

      <h1 className="text-3xl font-bold">Administration</h1>

      {/* Demo Credentials */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-500/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-400" />
          Demo Credentials by Account Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Admin User</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">admin@mlops.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-pink-400">Administrator</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">ML Engineer</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">alice@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-blue-400">ML Engineer</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Data Engineer</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">bob@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-green-400">Data Engineer</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Model Sponsor</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">carol@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-purple-400">Model Sponsor</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Data Scientist</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">david@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-indigo-400">Data Scientist</span></p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded p-4 border border-gray-700">
            <p className="text-sm font-medium text-blue-300 mb-2">Production Team</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gray-400">Email:</span> <span className="text-gray-100 font-mono">prod@org.com</span></p>
              <p><span className="text-gray-400">Password:</span> <span className="text-gray-100 font-mono">password</span></p>
              <p><span className="text-gray-400">Role:</span> <span className="text-red-400">Production Team</span></p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">💡 Tip: Use any of these credentials to test different user roles and their permissions</p>
      </div>
      
      {/* Pending User Approvals */}
      {users.filter(u => u.status === 'pending').length > 0 && (
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending User Approvals
            </h3>
            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 text-sm rounded-full">
              {users.filter(u => u.status === 'pending').length} pending
            </span>
          </div>

          <div className="space-y-3">
            {users.filter(u => u.status === 'pending').map(user => (
              <div key={user.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{user.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <select
                      defaultValue={user.role}
                      onChange={(e) => setUsers(users.map(u => u.id === user.id ? { ...u, role: e.target.value } : u))}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id} className="bg-gray-800">
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">User Management</h3>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setShowUserModal(true);
              }
            }}
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <SearchBar
            placeholder="Search users by name, email..."
            onSearch={setSearchQuery}
          />

          <div className="flex gap-2 flex-wrap">
            <FilterChip
              label="All"
              isActive={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <FilterChip
              label="Active"
              isActive={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
            />
            <FilterChip
              label="Pending"
              isActive={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
            />
            <FilterChip
              label="Inactive"
              isActive={statusFilter === 'inactive'}
              onClick={() => setStatusFilter('inactive')}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-3">Name</th>
                <th className="text-left py-3 px-3">Email</th>
                <th className="text-left py-3 px-3">Role</th>
                <th className="text-left py-3 px-3">Teams</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => {
                  const matchesSearch = searchQuery === '' || 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                  <td className="py-3 px-3">{user.name}</td>
                  <td className="py-3 px-3 text-gray-400">{user.email}</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {roles.find(r => r.id === user.role)?.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">{user.teams.join(', ')}</td>
                  <td className="py-3 px-3">
                    <span className="text-green-400 text-xs">● {user.status}</span>
                  </td>
                  <td className="py-3 px-3 flex gap-2">
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    {user.status !== 'pending' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 hover:bg-gray-600 rounded">
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Definitions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Role Definitions</h3>
          <button
            onClick={() => {
              setEditingRole(roles[0]);
              setShowRoleModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Roles
          </button>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-gray-700/30 rounded p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{role.name}</h4>
                <span className="text-xs px-2 py-1 bg-gray-600 rounded">{role.permissions.length} permissions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="text-xs px-2 py-1 bg-gray-600/50 rounded text-gray-300">
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Preview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Recent Admin Actions</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {[
            { action: 'User Approved', user: 'Evan Martinez', timestamp: '2 hours ago', status: 'success' },
            { action: 'Role Changed', user: 'Alice Johnson', timestamp: '5 hours ago', status: 'info' },
            { action: 'User Deleted', user: 'Test User', timestamp: '1 day ago', status: 'warning' },
            { action: 'Permission Updated', user: 'ML Engineer', timestamp: '2 days ago', status: 'info' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/30 rounded border border-gray-700">
              <div>
                <p className="font-medium text-sm">{log.action}</p>
                <p className="text-xs text-gray-400">{log.user}</p>
              </div>
              <p className="text-xs text-gray-500">{log.timestamp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">System Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Approval Threshold (for Prod)</label>
              <input
                type="number"
                defaultValue="2"
                min="1"
                max="5"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
              <p className="text-xs text-gray-400 mt-1">Number of approvals required for production deployment</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Drift Alert Threshold (%)</label>
              <input
                type="number"
                defaultValue="10"
                min="0"
                max="100"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                defaultValue="480"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Audit & Compliance</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">Audit Log Retention</p>
              <input
                type="number"
                defaultValue="365"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Days to retain audit logs</p>
            </div>

            <button className="w-full text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
              Export Audit Logs
            </button>

            <button className="w-full text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition">
              Generate Compliance Report
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Add User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                  placeholder="user@org.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Editor Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Role Permissions</h2>

            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold mb-3">{role.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(permission => (
                      <button
                        key={permission}
                        className="px-3 py-1 bg-blue-600/30 border border-blue-500 text-blue-300 rounded text-sm hover:bg-blue-600/50 transition"
                      >
                        {permission.replace(/_/g, ' ')}
                        <span className="ml-2 text-xs">×</span>
                      </button>
                    ))}
                    <button className="px-3 py-1 border border-dashed border-gray-500 text-gray-400 rounded text-sm hover:border-gray-400 transition">
                      + Add Permission
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showNotification('Role permissions updated', 'success');
                  setShowRoleModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
