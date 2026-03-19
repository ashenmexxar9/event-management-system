import React, { useEffect, useState } from 'react';
import { Trash2, Shield } from 'lucide-react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/Common';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  created_at?: string;
}

export const UserManagementPage: React.FC = () => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');

  useEffect(() => {
    // Wait until auth state is ready before deciding access.
    if (authLoading) return;

    // Redirect/deny if not admin
    if (currentUser?.role !== 'ADMIN') {
      addToast('Access denied', 'error');
      return;
    }
    loadUsers();
  }, [authLoading, currentUser?.role]);

  useEffect(() => {
    if (searchTerm) {
      searchUsers();
    } else {
      loadUsers();
    }
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error: any) {
      addToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.search(searchTerm);
      setUsers(response.data);
    } catch (error: any) {
      addToast('Search failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      await userService.delete(userId);
      addToast('User deleted successfully', 'success');
      loadUsers();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleRoleChange = async () => {
    if (!editingUser) return;

    try {
      await userService.updateRole(editingUser.id, { role: newRole });
      addToast('User role updated successfully', 'success');
      setShowRoleModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Update failed', 'error');
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    return filtered;
  };

  if (isLoading && users.length === 0) {
    return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading...</p></div>;
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all users and their roles</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No users found</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setNewRole(user.role === 'ADMIN' ? 'USER' : 'ADMIN');
                        setShowRoleModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      disabled={user.id === currentUser?.id}
                      title={user.id === currentUser?.id ? 'Cannot change own role' : 'Change role'}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      disabled={user.id === currentUser?.id}
                      title={user.id === currentUser?.id ? 'Cannot delete own account' : 'Delete user'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Change User Role</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">User: <span className="font-semibold">{editingUser.name}</span></p>
                <p className="text-sm text-gray-600 mb-4">Email: <span className="font-semibold">{editingUser.email}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
