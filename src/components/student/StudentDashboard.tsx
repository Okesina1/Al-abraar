import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { DashboardLayout } from '../common/DashboardLayout';
import { UstaadhBrowser } from './UstaadhBrowser';
import { BookingModal } from '../booking/BookingModal';
import { MessageCenter } from '../messaging/MessageCenter';
import { Calendar, BookOpen, CreditCard, Star, Clock, Users, MessageCircle, Search } from 'lucide-react';
import { User } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedUstaadh, setSelectedUstaadh] = useState<User | null>(null);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{id: string, name: string} | null>(null);

  const myBookings = user ? getBookingsByUser(user.id, 'student') : [];
  const upcomingLessons = myBookings.flatMap(booking => 
    booking.schedule.filter(slot => 
      slot.status === 'scheduled' && 
      new Date(slot.date) >= new Date()
    ).map(slot => ({
      id: slot.id,
      bookingId: booking.id,
      ustaadh: 'Ahmed Al-Hafiz', // In real app, fetch from user data
      ustaadhId: booking.ustaadhId,
      course: booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package',
      date: slot.date,
      time: slot.startTime,
      duration: `${booking.hoursPerDay} hour${booking.hoursPerDay > 1 ? 's' : ''}`,
      link: slot.meetingLink || 'https://meet.google.com/generate-link'
    }))
  );

  const stats = [
    { title: 'Active Subscriptions', value: myBookings.filter(b => b.status === 'confirmed').length.toString(), icon: BookOpen, color: 'bg-green-500' },
    { title: 'Lessons This Week', value: upcomingLessons.length.toString(), icon: Calendar, color: 'bg-blue-500' },
    { title: 'Total Spent', value: `$${myBookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.totalAmount : 0), 0)}`, icon: CreditCard, color: 'bg-yellow-500' },
    { title: 'Completed Lessons', value: '24', icon: Star, color: 'bg-purple-500' }
  ];

  const handleBookUstaadh = (ustaadh: User) => {
    setSelectedUstaadh(ustaadh);
    setShowBookingModal(true);
  };

  const handleMessageUstaadh = (ustaadhId: string, ustaadhName: string) => {
    setMessageRecipient({ id: ustaadhId, name: ustaadhName });
    setShowMessageCenter(true);
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
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="h-5 w-5 text-green-500 mr-2" />
          Upcoming Lessons
        </h3>
        {upcomingLessons.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming lessons scheduled</p>
            <button
              onClick={() => setActiveTab('browse')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Ustaadhs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{lesson.ustaadh}</h4>
                    <p className="text-gray-600">{lesson.course}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(lesson.date).toLocaleDateString()} at {lesson.time} • {lesson.duration}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Join Meeting
                  </a>
                  <button
                    onClick={() => handleMessageUstaadh(lesson.ustaadhId, lesson.ustaadh)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Subscriptions</h3>
        <div className="space-y-4">
          {myBookings.filter(b => b.status === 'confirmed').map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package'}
                  </h4>
                  <p className="text-gray-600">
                    {booking.hoursPerDay}h/day • {booking.daysPerWeek} days/week
                  </p>
                  <p className="text-sm text-gray-500">
                    Until {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">${booking.totalAmount}</p>
                <p className="text-sm text-gray-500">{booking.subscriptionMonths} month{booking.subscriptionMonths > 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBrowse = () => (
    <UstaadhBrowser 
      onBookUstaadh={handleBookUstaadh}
      onMessageUstaadh={handleMessageUstaadh}
    />
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'browse', label: 'Browse Ustaadhs', icon: Search },
    { id: 'lessons', label: 'My Lessons', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ];

  return (
    <DashboardLayout title="Student Dashboard" user={user}>
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
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'lessons' && <div className="bg-white rounded-xl shadow-md p-6"><p>Lesson history coming soon...</p></div>}
        {activeTab === 'payments' && <div className="bg-white rounded-xl shadow-md p-6"><p>Payment history coming soon...</p></div>}

        {/* Modals */}
        {showBookingModal && selectedUstaadh && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedUstaadh(null);
            }}
            ustaadh={selectedUstaadh}
          />
        )}

        {showMessageCenter && (
          <MessageCenter
            isOpen={showMessageCenter}
            onClose={() => {
              setShowMessageCenter(false);
              setMessageRecipient(null);
            }}
            recipientId={messageRecipient?.id}
            recipientName={messageRecipient?.name}
          />
        )}
      </div>
    </DashboardLayout>
  );
};