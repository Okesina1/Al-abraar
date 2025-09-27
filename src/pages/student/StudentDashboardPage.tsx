import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, CreditCard, Star, Clock, Users, MessageCircle, TrendingUp } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  // Mock data
  const stats = [
    { title: 'Active Subscriptions', value: '2', icon: BookOpen, color: 'bg-green-500' },
    { title: 'Lessons This Week', value: '4', icon: Calendar, color: 'bg-blue-500' },
    { title: 'Total Spent', value: '$336', icon: CreditCard, color: 'bg-yellow-500' },
    { title: 'Completed Lessons', value: '24', icon: Star, color: 'bg-purple-500' }
  ];

  const upcomingLessons = [
    {
      id: '1',
      ustaadh: 'Ahmed Al-Hafiz',
      ustaadhId: '2',
      course: 'Complete Package',
      date: '2024-01-16',
      time: '14:00',
      duration: '1.5 hours',
      link: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      ustaadh: 'Dr. Fatima Al-Zahra',
      ustaadhId: '6',
      course: 'Qur\'an & Tajweed',
      date: '2024-01-17',
      time: '16:00',
      duration: '1 hour',
      link: 'https://meet.google.com/def-ghi-jkl'
    }
  ];

  const activeSubscriptions = [
    {
      id: '1',
      packageType: 'Complete Package',
      ustaadh: 'Ahmed Al-Hafiz',
      hoursPerDay: 1.5,
      daysPerWeek: 3,
      totalAmount: 126,
      subscriptionMonths: 1,
      endDate: '2024-02-15',
      progress: 65
    },
    {
      id: '2',
      packageType: 'Qur\'an & Tajweed',
      ustaadh: 'Dr. Fatima Al-Zahra',
      hoursPerDay: 1,
      daysPerWeek: 2,
      totalAmount: 40,
      subscriptionMonths: 1,
      endDate: '2024-02-20',
      progress: 45
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, Sarah!</h1>
        <p className="text-green-100">Continue your Islamic learning journey with Al-Abraar</p>
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

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 text-green-500 mr-2" />
            Upcoming Lessons
          </h3>
          <Link to="/student/lessons" className="text-green-600 hover:text-green-700 text-sm font-medium">
            View All
          </Link>
        </div>
        {upcomingLessons.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming lessons scheduled</p>
            <Link
              to="/student/browse"
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Ustaadhs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
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
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    Join Meeting
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

      {/* Active Subscriptions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Active Subscriptions</h3>
          <Link to="/student/payments" className="text-green-600 hover:text-green-700 text-sm font-medium">
            View Payments
          </Link>
        </div>
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <div key={subscription.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{subscription.packageType}</h4>
                  <p className="text-gray-600">with {subscription.ustaadh}</p>
                  <p className="text-sm text-gray-500">
                    {subscription.hoursPerDay}h/day • {subscription.daysPerWeek} days/week
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">Progress</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subscription.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{subscription.progress}%</span>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <p className="font-semibold text-green-600">${subscription.totalAmount}</p>
                  <p className="text-sm text-gray-500">
                    Until {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/student/browse"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Find New Ustaadh</h4>
          <p className="text-sm text-gray-600">Browse and book lessons with verified teachers</p>
        </Link>

        <Link
          to="/messages"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Messages</h4>
          <p className="text-sm text-gray-600">Chat with your Ustaadhs</p>
        </Link>

        <Link
          to="/student/lessons"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Track Progress</h4>
          <p className="text-sm text-gray-600">View your learning progress and history</p>
        </Link>
      </div>
    </div>
  );
};