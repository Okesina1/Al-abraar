import React, { useState } from 'react';
import { Users, Search, Filter, Eye, Shield, Ban, Mail, Phone, MapPin } from 'lucide-react';
import { UserManagement } from '../../components/admin/UserManagement';

export const AdminUsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock users data
  const users = [
    {
      id: '1',
      fullName: 'System Administrator',
      email: 'admin@al-abraar.com',
      role: 'admin',
      phoneNumber: '+1234567890',
      country: 'USA',
      city: 'New York',
      age: 35,
      isApproved: true,
      createdAt: '2023-01-01T00:00:00Z',
      lastLogin: '2024-01-15T10:30:00Z',
      status: 'active'
    },
    {
      id: '2',
      fullName: 'Ahmed Al-Hafiz',
      email: 'ahmed.alhafiz@email.com',
      role: 'ustaadh',
      phoneNumber: '+966123456789',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      age: 35,
      isApproved: true,
      createdAt: '2023-01-15T10:00:00Z',
      lastLogin: '2024-01-15T08:45:00Z',
      status: 'active',
      rating: 4.9,
      reviewCount: 127,
      totalEarnings: 2450
    },
    {
      id: '3',
      fullName: 'Sarah Ahmed',
      email: 'student@al-abraar.com',
      role: 'student',
      phoneNumber: '+1987654321',
      country: 'Canada',
      city: 'Toronto',
      age: 28,
      isApproved: true,
      createdAt: '2023-02-01T14:30:00Z',
      lastLogin: '2024-01-14T16:20:00Z',
      status: 'active',
      totalSpent: 336,
      completedLessons: 24
    },
    {
      id: '6',
      fullName: 'Dr. Fatima Al-Zahra',
      email: 'fatima.alzahra@email.com',
      role: 'ustaadh',
      phoneNumber: '+20123456789',
      country: 'Egypt',
      city: 'Cairo',
      age: 42,
      isApproved: true,
      createdAt: '2023-02-20T14:30:00Z',
      lastLogin: '2024-01-13T12:15:00Z',
      status: 'active',
      rating: 4.8,
      reviewCount: 89,
      totalEarnings: 1890
    },
    {
      id: '4',
      fullName: 'Ali Hassan',
      email: 'ali.hassan@email.com',
      role: 'student',
      phoneNumber: '+44123456789',
      country: 'United Kingdom',
      city: 'London',
      age: 32,
      isApproved: true,
      createdAt: '2023-03-10T09:15:00Z',
      lastLogin: '2024-01-12T14:30:00Z',
      status: 'active',
      totalSpent: 180,
      completedLessons: 12
    },
    {
      id: '5',
      fullName: 'Inactive User',
      email: 'inactive@email.com',
      role: 'student',
      phoneNumber: '+1555123456',
      country: 'USA',
      city: 'Chicago',
      age: 25,
      isApproved: true,
      createdAt: '2023-04-05T16:45:00Z',
      lastLogin: '2023-12-01T10:00:00Z',
      status: 'inactive',
      totalSpent: 0,
      completedLessons: 0
    }
  ];

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSuspendUser = (userId: string) => {
    console.log('Suspending user:', userId);
    // In real app, call API to suspend user
  };

  const handleActivateUser = (userId: string) => {
    console.log('Activating user:', userId);
    // In real app, call API to activate user
  };

  const UserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedUser.fullName}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.city}, {selectedUser.country}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Account Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Age:</span> {selectedUser.age} years</p>
                    <p><span className="font-medium">Member Since:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Last Login:</span> {new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedUser.role === 'ustaadh' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Teaching Stats</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Rating:</span> {selectedUser.rating}/5 ({selectedUser.reviewCount} reviews)</p>
                      <p><span className="font-medium">Total Earnings:</span> ${selectedUser.totalEarnings}</p>
                      <p><span className="font-medium">Status:</span> {selectedUser.isApproved ? 'Approved' : 'Pending'}</p>
                    </div>
                  </div>
                )}

                {selectedUser.role === 'student' && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Learning Stats</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Total Spent:</span> ${selectedUser.totalSpent}</p>
                      <p><span className="font-medium">Completed Lessons:</span> {selectedUser.completedLessons}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Send Message</span>
              </button>
              {selectedUser.status === 'active' ? (
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                  <Ban className="h-4 w-4" />
                  <span>Suspend</span>
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Activate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stats = [
    { title: 'Total Users', value: users.length.toString(), color: 'bg-blue-500' },
    { title: 'Students', value: users.filter(u => u.role === 'student').length.toString(), color: 'bg-green-500' },
    { title: 'Ustaadhs', value: users.filter(u => u.role === 'ustaadh').length.toString(), color: 'bg-purple-500' },
    { title: 'Active Today', value: users.filter(u => new Date(u.lastLogin).toDateString() === new Date().toDateString()).length.toString(), color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="text-sm text-gray-600">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Management Component */}
      <UserManagement
        users={users}
        onViewUser={handleViewUser}
        onSuspendUser={handleSuspendUser}
        onActivateUser={handleActivateUser}
      />

      {showModal && <UserModal />}
    </div>
  );
};