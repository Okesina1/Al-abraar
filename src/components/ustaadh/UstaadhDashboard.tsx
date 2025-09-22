import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { DashboardLayout } from '../common/DashboardLayout';
import { AvailabilityCalendar } from '../calendar/AvailabilityCalendar';
import { MessageCenter } from '../messaging/MessageCenter';
import { Calendar, Users, DollarSign, BookOpen, Clock, Star } from 'lucide-react';

export const UstaadhDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{id: string, name: string} | null>(null);

  const myBookings = user ? getBookingsByUser(user.id, 'ustaadh') : [];
  const upcomingLessons = myBookings.flatMap(booking => 
    booking.schedule.filter(slot => 
      slot.status === 'scheduled' && 
      new Date(slot.date) >= new Date()
    ).map(slot => ({
      id: slot.id,
      bookingId: booking.id,
      student: 'Student Name', // In real app, fetch from user data
      studentId: booking.studentId,
      course: booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package',
      time: slot.startTime,
      duration: `${booking.hoursPerDay} hour${booking.hoursPerDay > 1 ? 's' : ''}`,
      link: slot.meetingLink || 'https://meet.google.com/generate-link'
    }))
  );

  const stats = [
    { title: 'Active Students', value: myBookings.filter(b => b.status === 'confirmed').length.toString(), icon: Users, color: 'bg-blue-500' },
    { title: 'This Week\'s Lessons', value: upcomingLessons.length.toString(), icon: Calendar, color: 'bg-green-500' },
    { title: 'Monthly Earnings', value: `$${myBookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.totalAmount : 0), 0)}`, icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'Average Rating', value: '4.9', icon: Star, color: 'bg-purple-500' }
  ];

  const recentStudents = [
    { id: '1', name: 'Sara Ahmed', course: 'Qur\'an & Tajweed', progress: '85%', lastLesson: '2024-01-14' },
    { id: '2', name: 'Ali Hassan', course: 'Complete Package', progress: '92%', lastLesson: '2024-01-14' },
    { id: '3', name: 'Aisha Rahman', course: 'Qur\'an & Tajweed', progress: '78%', lastLesson: '2024-01-13' }
  ];

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

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="h-5 w-5 text-green-500 mr-2" />
          Today's Lessons
        </h3>
        <div className="space-y-4">
          {upcomingLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{lesson.student}</h4>
                  <p className="text-gray-600">{lesson.course}</p>
                  <p className="text-sm text-gray-500">{lesson.time} • {lesson.duration}</p>
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
                  onClick={() => {
                    setMessageRecipient({
                      id: lesson.studentId,
                      name: lesson.student
                    });
                    setShowMessageCenter(true);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Message Student
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Progress</h3>
        <div className="space-y-4">
          {recentStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.course}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{student.progress}</p>
                <p className="text-sm text-gray-500">Last: {student.lastLesson}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <AvailabilityCalendar />
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'earnings', label: 'Earnings', icon: DollarSign }
  ];

  return (
    <DashboardLayout title="Ustaadh Dashboard" user={user}>
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
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'students' && <div className="bg-white rounded-xl shadow-md p-6"><p>Students management coming soon...</p></div>}
        {activeTab === 'earnings' && <div className="bg-white rounded-xl shadow-md p-6"><p>Earnings tracking coming soon...</p></div>}

        {/* Message Center Modal */}
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