import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, DollarSign, Star, Clock, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsApi, payrollApi, reviewsApi, usersApi } from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardStats {
  activeStudents: number;
  weekLessons: number;
  monthlyEarnings: number;
  averageRating: number;
}

export const UstaadhDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    weekLessons: 0,
    monthlyEarnings: 0,
    averageRating: 0
  });
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [monthStats, setMonthStats] = useState({
    completedLessons: 0,
    newStudents: 0,
    earnings: 0
  });
  const [payrollCurrency, setPayrollCurrency] = useState<string>('USD');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [bookingsResponse, payrollResponse, reviewsResponse, approvedUstaadhsResponse] = await Promise.all([
          bookingsApi.getMyBookings(),
          payrollApi.getMyCompensationPlan().catch(() => null),
          reviewsApi.getMyReviews().catch(() => ({ reviews: [], averageRating: 0 })),
          usersApi.getApprovedUstaadhss({ limit: '100' }).catch(() => null),
        ]);

        if (!isMounted) return;

        const bookingsData = Array.isArray(bookingsResponse?.bookings)
          ? bookingsResponse.bookings
          : Array.isArray(bookingsResponse)
          ? bookingsResponse
          : [];

        const confirmedBookings = bookingsData.filter((b: any) => b.status === 'confirmed');

        const uniqueStudents = new Set(
          confirmedBookings.map((b: any) =>
            typeof b.studentId === 'object' ? b.studentId.id || b.studentId._id : b.studentId
          )
        );

        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekLessons = confirmedBookings.reduce((count: number, b: any) => {
          const scheduleItems = b.schedule || [];
          return (
            count +
            scheduleItems.filter((s: any) => {
              const lessonDate = new Date(s.date);
              return lessonDate >= oneWeekAgo && lessonDate <= today;
            }).length
          );
        }, 0);

        const upcoming = bookingsData
          .filter((b: any) => b.status === 'confirmed')
          .flatMap((b: any) => {
            const scheduleItems = b.schedule || [];
            return scheduleItems
              .filter((s: any) => new Date(s.date) >= new Date())
              .slice(0, 2)
              .map((s: any) => {
                const studentName =
                  typeof b.studentId === 'object' && b.studentId !== null
                    ? b.studentId.fullName
                    : b.studentName || 'Student';
                return {
                  id: b.id || b._id,
                  studentName,
                  studentId: typeof b.studentId === 'object' ? b.studentId.id || b.studentId._id : b.studentId,
                  course: b.packageType,
                  date: s.date,
                  time: s.startTime,
                  duration: `${b.hoursPerDay || 1} hour${(b.hoursPerDay || 1) > 1 ? 's' : ''}`,
                  link: b.meetingLink || '#'
                };
              });
          })
          .slice(0, 3);

  // Normalize payroll response shape: handle wrappers like { data }, { plan }, or direct plan
  const normalizePlanResponse = (resp: any) => {
    if (!resp) return null;
    // unwrap common layers
    let candidate = resp;
    if (resp.data && resp.data.plan) candidate = resp.data.plan;
    else if (resp.data && typeof resp.data === 'object' && (resp.data.monthlySalary || resp.data.currency)) candidate = resp.data;
    else if (resp.plan) candidate = resp.plan;
    // if candidate is an array, pick first object
    if (Array.isArray(candidate)) candidate = candidate[0] ?? null;
    if (!candidate || typeof candidate !== 'object') return null;
    return {
      ...candidate,
      monthlySalary: Number(candidate.monthlySalary ?? 0),
      currency: (candidate.currency as string) || 'USD',
      salaryHistory: Array.isArray(candidate.salaryHistory)
        ? candidate.salaryHistory.map((r: any) => ({
            ...r,
            amount: Number(r?.amount ?? candidate.monthlySalary ?? 0),
            adjustments: Array.isArray(r?.adjustments) ? r.adjustments.map((a: any) => ({ ...a, amount: Number(a?.amount ?? 0) })) : [],
          }))
        : [],
    };
  };

  const planData = normalizePlanResponse(payrollResponse);
  // Debug: show raw payroll response and normalized planData so we can verify what the server returned
  try {
    // eslint-disable-next-line no-console
    console.debug('[UstaadhDashboard] payrollResponse raw:', payrollResponse, 'normalized planData:', planData);
  } catch (e) {
    // ignore
  }
  const monthlyEarnings = Number(planData?.monthlySalary ?? 0) || 0;
  const currencyFromPlan = (planData && planData.currency) || 'USD';

        const avgRating = reviewsResponse?.averageRating || user?.rating || 0;

        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const completedThisMonth = bookingsData
          .filter((b: any) => b.status === 'completed')
          .reduce((count: number, b: any) => {
            const scheduleItems = b.schedule || [];
            return (
              count +
              scheduleItems.filter((s: any) => {
                const lessonDate = new Date(s.date);
                return lessonDate >= oneMonthAgo && lessonDate <= today;
              }).length
            );
          }, 0);

        const newStudentsThisMonth = bookingsData.filter((b: any) => {
          const createdDate = new Date(b.createdAt);
          return createdDate >= oneMonthAgo && createdDate <= today;
        }).length;

        const activities: any[] = [];

        bookingsData
          .filter((b: any) => b.status === 'completed')
          .slice(0, 2)
          .forEach((b: any) => {
            const studentName =
              typeof b.studentId === 'object' && b.studentId !== null ? b.studentId.fullName : 'Student';
            activities.push({
              type: 'lesson',
              message: `Completed lesson with ${studentName}`,
              time: new Date(b.updatedAt || b.createdAt).toLocaleDateString()
            });
          });

        const reviews = Array.isArray(reviewsResponse?.reviews) ? reviewsResponse.reviews : [];
        reviews.slice(0, 1).forEach((r: any) => {
          activities.push({
            type: 'review',
            message: `Received ${r.rating}-star review`,
            time: new Date(r.createdAt).toLocaleDateString()
          });
        });

        bookingsData.slice(0, 1).forEach((b: any) => {
          const studentName =
            typeof b.studentId === 'object' && b.studentId !== null ? b.studentId.fullName : 'Student';
          activities.push({
            type: 'booking',
            message: `New booking from ${studentName}`,
            time: new Date(b.createdAt).toLocaleDateString()
          });
        });

        setStats({
          activeStudents: uniqueStudents.size,
          weekLessons,
          monthlyEarnings,
          averageRating: avgRating
        });

        setPayrollCurrency(currencyFromPlan);

        setUpcomingLessons(upcoming);
        setRecentActivities(activities.slice(0, 4));
        setMonthStats({
          completedLessons: completedThisMonth,
          newStudents: newStudentsThisMonth,
          earnings: monthlyEarnings
        });

        // Derive unique specialties (categories) from approved ustaadhs response
        try {
          const ustaadhsList = Array.isArray(approvedUstaadhsResponse?.ustaadhs)
            ? approvedUstaadhsResponse.ustaadhs
            : Array.isArray(approvedUstaadhsResponse)
            ? approvedUstaadhsResponse
            : Array.isArray(approvedUstaadhsResponse?.data)
            ? approvedUstaadhsResponse.data
            : [];

          const unique = new Set<string>();
          ustaadhsList.forEach((u: any) => {
            (u.specialties || []).forEach((s: string) => {
              if (s && typeof s === 'string') unique.add(s.trim());
            });
          });

          setCategories(Array.from(unique).slice(0, 24));
        } catch (err) {
          // ignore
        }
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
  }, [user]);

  const statsCards = [
    { title: 'Active Students', value: stats.activeStudents.toString(), icon: Users, color: 'bg-blue-500' },
    { title: "This Week's Lessons", value: stats.weekLessons.toString(), icon: Calendar, color: 'bg-green-500' },
    {
      title: 'Monthly Earnings',
      value: new Intl.NumberFormat(undefined, { style: 'currency', currency: payrollCurrency }).format(stats.monthlyEarnings),
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    { title: 'Average Rating', value: stats.averageRating.toFixed(1), icon: Star, color: 'bg-purple-500' }
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
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Assalamu Alaikum, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-green-100">Ready to inspire and teach today?</p>
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
              <span className="font-semibold text-green-600">{monthStats.completedLessons}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">New Students</span>
              </div>
              <span className="font-semibold text-blue-600">{monthStats.newStudents}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-800">Average Rating</span>
              </div>
              <span className="font-semibold text-yellow-600">{stats.averageRating.toFixed(1)}/5</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">Earnings</span>
              </div>
              <span className="font-semibold text-purple-600">{new Intl.NumberFormat(undefined, { style: 'currency', currency: payrollCurrency }).format(monthStats.earnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories / Specialties */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Popular Specialties</h3>
          <Link to="/ustaadh/students" className="text-green-600 hover:text-green-700 text-sm font-medium">
            View all
          </Link>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-600">No specialties available yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-800">
                {cat}
              </span>
            ))}
          </div>
        )}
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