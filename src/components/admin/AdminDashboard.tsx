import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { DashboardLayout } from '../common/DashboardLayout';
import { Users, BookOpen, DollarSign, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookings } = useBooking();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for pending approvals
  const [pendingUstaadhApprovals, setPendingUstaadhApprovals] = useState([
    {
      id: '4',
      fullName: 'Dr. Omar Al-Rashid',
      email: 'omar.rashid@email.com',
      country: 'Egypt',
      city: 'Cairo',
      age: 42,
      phoneNumber: '+20123456789',
      experience: '15 years teaching Islamic studies',
      specialties: ['Qur\'an', 'Tajweed', 'Arabic', 'Fiqh'],
      submittedAt: '2024-01-14T10:30:00Z',
      cvUrl: '/cv/omar-rashid.pdf'
    },
    {
      id: '5',
      fullName: 'Ustadh Yusuf Hassan',
      email: 'yusuf.hassan@email.com',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      age: 38,
      phoneNumber: '+60123456789',
      experience: '12 years in Islamic education',
      specialties: ['Qur\'an', 'Tajweed', 'Hadeeth'],
      submittedAt: '2024-01-13T15:45:00Z',
      cvUrl: '/cv/yusuf-hassan.pdf'
    }
  ]);

  const stats = [
    { 
      title: 'Total Students', 
      value: '1,247', 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      title: 'Active Ustaadhs', 
      value: '89', 
      icon: BookOpen, 
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    { 
      title: 'Monthly Revenue', 
      value: '$24,580', 
      icon: DollarSign, 
      color: 'bg-yellow-500',
      change: '+18%',
      changeType: 'positive'
    },
    { 
      title: 'Pending Approvals', 
      value: pendingUstaadhApprovals.length.toString(), 
      icon: Clock, 
      color: 'bg-orange-500',
      change: '-2',
      changeType: 'neutral'
    }
  ];

  const recentBookings = bookings.slice(0, 5).map(booking => ({
    ...booking,
    studentName: 'Student Name', // In real app, fetch from user data
    ustaadhName: 'Ustaadh Name'
  }));

  const handleApproveUstaadh = (ustaadhId: string) => {
    setPendingUstaadhApprovals(prev => prev.filter(u => u.id !== ustaadhId));
    // In real app, update user status in database
    alert('Ustaadh approved successfully! Confirmation email sent.');
  };

  const handleRejectUstaadh = (ustaadhId: string) => {
    setPendingUstaadhApprovals(prev => prev.filter(u => u.id !== ustaadhId));
    // In real app, update user status and send rejection email
    alert('Ustaadh application rejected. Notification email sent.');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.studentName}</p>
                  <p className="text-sm text-gray-600">{booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package'}</p>
                  <p className="text-xs text-gray-500">${booking.totalAmount}</p>
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
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Pending Approvals</p>
                <p className="text-xs text-orange-600">{pendingUstaadhApprovals.length} Ustaadh applications awaiting review</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Platform Update</p>
                <p className="text-xs text-blue-600">New messaging features deployed successfully</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Payment Processing</p>
                <p className="text-xs text-green-600">All transactions processed successfully today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Pending Ustaadh Approvals</h3>
      
      {pendingUstaadhApprovals.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending approvals at this time</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUstaadhApprovals.map((ustaadh) => (
            <div key={ustaadh.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800">{ustaadh.fullName}</h4>
                      <p className="text-gray-600">{ustaadh.email}</p>
                      <p className="text-sm text-gray-500">{ustaadh.city}, {ustaadh.country}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact Information</p>
                      <p className="text-sm text-gray-600">Phone: {ustaadh.phoneNumber}</p>
                      <p className="text-sm text-gray-600">Age: {ustaadh.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm text-gray-600">{ustaadh.experience}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {ustaadh.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(ustaadh.submittedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-3 ml-6">
                  <a
                    href={ustaadh.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm text-center"
                  >
                    View CV
                  </a>
                  <button
                    onClick={() => handleApproveUstaadh(ustaadh.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectUstaadh(ustaadh.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  return (
    <DashboardLayout title="Admin Dashboard" user={user}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.id === 'approvals' && pendingUstaadhApprovals.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingUstaadhApprovals.length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'users' && <div className="bg-white rounded-xl shadow-md p-6"><p>User management coming soon...</p></div>}
        {activeTab === 'bookings' && <div className="bg-white rounded-xl shadow-md p-6"><p>Booking management coming soon...</p></div>}
        {activeTab === 'payments' && <div className="bg-white rounded-xl shadow-md p-6"><p>Payment management coming soon...</p></div>}
      </div>
    </DashboardLayout>
  );
};