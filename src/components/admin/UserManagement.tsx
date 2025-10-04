import React, { useState } from 'react';
import { Users, Search, Filter, Eye, Shield, Ban, MoreVertical } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'ustaadh' | 'student';
  phoneNumber?: string;
  country?: string;
  city?: string;
  age?: number;
  isApproved?: boolean;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  rating?: number;
  reviewCount?: number;
  totalEarnings?: number;
  totalSpent?: number;
  completedLessons?: number;
}

interface UserManagementProps {
  users: User[];
  onViewUser: (user: User) => void;
  onSuspendUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onViewUser,
  onSuspendUser,
  onActivateUser
}) => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('al-abraar-user') : null;
  let currentUser: any = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // lazy-import to avoid cycles
      const { normalizeUser } = require('../../utils/user');
      currentUser = normalizeUser(parsed);
    } catch (e) {
      currentUser = null;
    }
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'ustaadh': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="ustaadh">Ustaadh</option>
            <option value="student">Student</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Users Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 lg:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 truncate">{user.fullName}</h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm text-gray-800 truncate">{user.city}, {user.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login:</span>
                <span className="text-sm text-gray-800">{new Date(user.lastLogin).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Role-specific stats */}
            {user.role === 'ustaadh' && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium text-blue-800 ml-1">{user.rating}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reviews:</span>
                    <span className="font-medium text-blue-800 ml-1">{user.reviewCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Earnings:</span>
                    <span className="font-medium text-blue-800 ml-1">${user.totalEarnings}</span>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'student' && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Spent:</span>
                    <span className="font-medium text-green-800 ml-1">${user.totalSpent}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-medium text-green-800 ml-1">{user.completedLessons}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => onViewUser(user)}
                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              {user.status === 'active' ? (
                <button
                  onClick={() => onSuspendUser(user.id)}
                  disabled={currentUser && (currentUser.id === user.id || currentUser._id === user.id)}
                  className={`px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center space-x-1 ${currentUser && (currentUser.id === user.id || currentUser._id === user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Ban className="h-4 w-4" />
                  <span>{currentUser && (currentUser.id === user.id || currentUser._id === user.id) ? 'Cannot suspend self' : 'Suspend'}</span>
                </button>
              ) : (
                <button
                  onClick={() => onActivateUser(user.id)}
                  className="px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Activate</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
};
