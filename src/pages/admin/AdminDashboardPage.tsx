import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, DollarSign, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  // Mock data
  const stats = [
    { 
      title: 'Total Students', 
      value: '1,247', 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    { 
      title: 'Active Ustaadhs', 
      value: '89', 
      icon: BookOpen, 
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive' as const
    },
    { 
      title: 'Monthly Revenue', 
      value: '$24,580', 
      icon: DollarSign, 
      color: 'bg-yellow-500',
      change: '+18%',
      changeType: 'positive' as const
    },
    { 
      title: 'Pending Approvals', 
      value: '3', 
      icon: Clock, 
      color: 'bg-orange-500',
      change: '-2',
      changeType: 'neutral' as const
    }
  ];

  const recentBookings = [
    { id: '1', studentName: 'Sarah Ahmed', packageType: 'Complete Package', amount: 126, status: 'confirmed', date: '2024-01-15' },
    { id: '2', studentName: 'Ali Hassan', packageType: 'Qur\'an & Tajweed', amount: 80, status: 'pending', date: '2024-01-14' },
    { id: '3', studentName: 'Fatima Rahman', packageType: 'Complete Package', amount: 210, status: 'confirmed', date: '2024-01-13' },
  ];

  const pendingApprovals = [
    { id: '1', name: 'Dr. Omar Al-Rashid', country: 'Egypt', submittedAt: '2024-01-14' },
    { id: '2', name: 'Ustadh Yusuf Hassan', country: 'Malaysia', submittedAt: '2024-01-13' },
    { id: '3', name: 'Ustadha Khadija Ali', country: 'Morocco', submittedAt: '2024-01-12' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 mr-1 ${
                    stat.changeType === 'positive' ? 'text-green-500' : 
                    stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change} this month
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.studentName}</p>
                  <p className="text-sm text-gray-600">{booking.packageType}</p>
                  <p className="text-xs text-gray-500">${booking.amount}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
            <Link to="/admin/approvals" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Review All
            </Link>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{approval.name}</p>
                  <p className="text-sm text-gray-600">{approval.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(approval.submittedAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-1 mt-1">
                    <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800">Pending Approvals</p>
              <p className="text-xs text-orange-600">3 Ustaadh applications awaiting review</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Platform Update</p>
              <p className="text-xs text-blue-600">New messaging features deployed successfully</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Payment Processing</p>
              <p className="text-xs text-green-600">All transactions processed successfully today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};