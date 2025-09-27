import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, Star, Clock, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

export const UstaadhDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();

  const bookings = user ? getBookingsByUser(user.id, 'ustaadh') : [];

  // Mock data for dashboard
  const stats = [
    { title: 'Active Students', value: '8', icon: Users, color: 'bg-blue-500' },
    { title: 'This Week\'s Lessons', value: '12', icon: Calendar, color: 'bg-green-500' },
    { title: 'Monthly Earnings', value: '$1,680', icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'Average Rating', value: '4.9', icon: Star, color: 'bg-purple-500' }
  ];

  const upcomingLessons = [
    {
      id: '1',
      studentName: 'Sarah Ahmed',
      studentId: '3',
      course: 'Complete Package',
      date: '2024-01-16',
      time: '14:00',
      duration: '1.5 hours',
      link: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      studentName: 'Ali Hassan',
      studentId: '4',
      course: 'Qur\'an & Tajweed',
      date: '2024-01-16',
      time: '16:00',
      duration: '1 hour',
      link: 'https://meet.google.com/def-ghi-jkl'
    },
    {
      id: '3',
      studentName: 'Fatima Rahman',
      studentId: '5',
      course: 'Complete Package',
      date: '2024-01-17',
      time: '10:00',
      duration: '2 hours',
      link: 'https://meet.google.com/ghi-jkl-mno'
    }
  ];

  const recentActivities = [
    { type: 'lesson', message: 'Completed lesson with Sarah Ahmed', time: '2 hours ago' },
    { type: 'review', message: 'Received 5-star review from Ali Hassan', time: '1 day ago' },
    { type: 'booking', message: 'New booking from Fatima Rahman', time: '2 days ago' },
    { type: 'payment', message: 'Payment received: $126', time: '3 days ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Assalamu Alaikum, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-green-100">Ready to inspire and teach today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-4 lg:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 text-green-500 mr-2" />
            Today's Lessons
          </h3>
          <Link to="/ustaadh/schedule" className="text-green-600 hover:text-green-700 text-sm font-medium">
            Manage Schedule
          </Link>
        </div>
        {upcomingLessons.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No lessons scheduled for today</p>
            <Link
              to="/ustaadh/schedule"
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Set Availability
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingLessons.slice(0, 3).map((lesson) => (
              <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{lesson.studentName}</h4>
                    <p className="text-gray-600">{lesson.course}</p>
                    <p className="text-sm text-gray-500">
                      {lesson.time} • {lesson.duration}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    Start Meeting
                  </a>
                  <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'lesson' ? 'bg-green-100' :
                  activity.type === 'review' ? 'bg-yellow-100' :
                  activity.type === 'booking' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {activity.type === 'lesson' && <BookOpen className="h-4 w-4 text-green-600" />}
                  {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'booking' && <Calendar className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-800">Lessons Completed</span>
              </div>
              <span className="font-semibold text-green-600">32</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">New Students</span>
              </div>
              <span className="font-semibold text-blue-600">3</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-800">Average Rating</span>
              </div>
              <span className="font-semibold text-yellow-600">4.9/5</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">Earnings</span>
              </div>
              <span className="font-semibold text-purple-600">$1,680</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/ustaadh/students"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Manage Students</h4>
          <p className="text-sm text-gray-600">View and communicate with your students</p>
        </Link>

        <Link
          to="/messages"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Messages</h4>
          <p className="text-sm text-gray-600">Chat with your students</p>
        </Link>

        <Link
          to="/ustaadh/earnings"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">View Earnings</h4>
          <p className="text-sm text-gray-600">Track your income and analytics</p>
        </Link>
      </div>
    </div>
  );
};