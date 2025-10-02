import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BookOpen, CreditCard, Star, Clock, Users, MessageCircle, TrendingUp } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, paymentsApi, achievementsApi, referralsApi } from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardStats {
  activeSubscriptions: number;
  lessonsThisWeek: number;
  totalSpent: number;
  completedLessons: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description?: string;
  earnedAt: string;
  metadata?: any;
}

interface ReferralData {
  referralCode: string;
  referrals: any[];
  totalRewards: number;
  completedCount: number;
}

export const StudentDashboardPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeSubscriptions: 0,
    lessonsThisWeek: 0,
    totalSpent: 0,
    completedLessons: 0
  });
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [bookingsResponse, paymentHistoryResponse, achievementsResponse, referralsResponse] = await Promise.all([
          bookingsApi.getMyBookings(),
          paymentsApi.getPaymentHistory().catch(() => ({ payments: [], total: 0 })),
          achievementsApi.getMyAchievements().catch(() => []),
          referralsApi.getMyReferrals().catch(() => null)
        ]);

        if (!isMounted) return;

        const bookingsData = Array.isArray(bookingsResponse?.bookings)
          ? bookingsResponse.bookings
          : Array.isArray(bookingsResponse)
          ? bookingsResponse
          : [];

        const activeBookings = bookingsData.filter(
          (b: any) => b.status === 'confirmed' || b.status === 'pending'
        );

        const upcoming = bookingsData
          .filter((b: any) => {
            if (b.status !== 'confirmed') return false;
            const scheduleItems = b.schedule || [];
            return scheduleItems.some((s: any) => {
              const lessonDate = new Date(s.date);
              return lessonDate >= new Date();
            });
          })
          .flatMap((b: any) => {
            const scheduleItems = b.schedule || [];
            return scheduleItems
              .filter((s: any) => new Date(s.date) >= new Date())
              .slice(0, 2)
              .map((s: any) => {
                const ustaadhName =
                  typeof b.ustaadhId === 'object' && b.ustaadhId !== null
                    ? b.ustaadhId.fullName
                    : b.ustaadhName || 'Ustaadh';
                return {
                  id: b.id || b._id,
                  ustaadh: ustaadhName,
                  ustaadhId: typeof b.ustaadhId === 'object' ? b.ustaadhId.id || b.ustaadhId._id : b.ustaadhId,
                  course: b.packageType,
                  date: s.date,
                  time: s.startTime,
                  duration: `${b.hoursPerDay || 1} hour${(b.hoursPerDay || 1) > 1 ? 's' : ''}`,
                  link: b.meetingLink || '#'
                };
              });
          })
          .slice(0, 3);

        const completedLessonsCount = bookingsData
          .filter((b: any) => b.status === 'completed')
          .reduce((count: number, b: any) => {
            return count + (b.schedule ? b.schedule.length : 0);
          }, 0);

        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lessonsThisWeek = bookingsData
          .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
          .reduce((count: number, b: any) => {
            const scheduleItems = b.schedule || [];
            return (
              count +
              scheduleItems.filter((s: any) => {
                const lessonDate = new Date(s.date);
                return lessonDate >= oneWeekAgo && lessonDate <= today;
              }).length
            );
          }, 0);

        const payments = Array.isArray(paymentHistoryResponse?.payments)
          ? paymentHistoryResponse.payments
          : Array.isArray(paymentHistoryResponse)
          ? paymentHistoryResponse
          : [];

        const totalSpent = payments
          .filter((p: any) => p.status === 'succeeded' || p.status === 'completed')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        const activeWithProgress = activeBookings.map((b: any) => {
          const ustaadhName =
            typeof b.ustaadhId === 'object' && b.ustaadhId !== null
              ? b.ustaadhId.fullName
              : b.ustaadhName || 'Ustaadh';

          const totalScheduled = b.schedule ? b.schedule.length : 0;
          const completed = b.schedule
            ? b.schedule.filter((s: any) => new Date(s.date) < new Date()).length
            : 0;
          const progress = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

          return {
            id: b.id || b._id,
            packageType: b.packageType,
            ustaadh: ustaadhName,
            hoursPerDay: b.hoursPerDay,
            daysPerWeek: b.daysPerWeek,
            totalAmount: b.totalAmount,
            subscriptionMonths: b.subscriptionMonths,
            endDate: b.endDate,
            progress
          };
        });

        setStats({
          activeSubscriptions: activeBookings.length,
          lessonsThisWeek,
          totalSpent,
          completedLessons: completedLessonsCount
        });

        setUpcomingLessons(upcoming);
        setActiveSubscriptions(activeWithProgress);
        setAchievements(Array.isArray(achievementsResponse) ? achievementsResponse : []);
        setReferralData(referralsResponse);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statsCards = [
    { title: 'Active Subscriptions', value: stats.activeSubscriptions.toString(), icon: BookOpen, color: 'bg-green-500' },
    { title: 'Lessons This Week', value: stats.lessonsThisWeek.toString(), icon: Calendar, color: 'bg-blue-500' },
    { title: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: CreditCard, color: 'bg-yellow-500' },
    { title: 'Completed Lessons', value: stats.completedLessons.toString(), icon: Star, color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-green-100">Continue your Islamic learning journey with Al-Abraar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => (
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

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        {achievements.length === 0 ? (
          <p className="text-gray-500 text-sm">Complete lessons and activities to earn achievements!</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement) => {
              const colorClasses = {
                streak: 'bg-green-100 text-green-800',
                milestone: 'bg-yellow-100 text-yellow-800',
                reviewer: 'bg-blue-100 text-blue-800',
                loyalty: 'bg-purple-100 text-purple-800',
                progress: 'bg-pink-100 text-pink-800',
              };
              const colorClass = colorClasses[achievement.type as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800';

              return (
                <span
                  key={achievement.id}
                  className={`px-3 py-1 rounded-full text-sm ${colorClass}`}
                  title={achievement.description}
                >
                  {achievement.title}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Referral Program */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Refer a Friend</h3>
        <p className="text-sm text-gray-600 mb-4">Invite friends and earn discounts on your next month.</p>
        {referralData ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                readOnly
                value={`${window.location.origin}/register?ref=${referralData.referralCode}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralData.referralCode}`);
                  toast.success('Referral link copied!');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Copy Link
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You have earned {referralData.completedCount} reward{referralData.completedCount !== 1 ? 's' : ''} so far
              {referralData.totalRewards > 0 && ` ($${referralData.totalRewards} total)`}.
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading referral information...</p>
        )}
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
