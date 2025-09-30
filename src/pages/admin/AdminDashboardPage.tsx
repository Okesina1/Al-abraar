import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { analyticsApi, bookingsApi, usersApi } from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User } from '../../types';

interface DashboardStats {
  totalStudents: number;
  totalUstaadhss: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageRating: number;
}

interface DashboardBooking {
  id: string;
  studentName: string;
  packageType: string;
  amount: number;
  status: string;
  date: string;
}

type ChangeType = 'positive' | 'negative' | 'neutral';

const formatCurrency = (value?: number) => {
  if (typeof value !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const getChangeLabel = (value?: number) => {
  if (typeof value !== 'number') return undefined;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
};

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<DashboardBooking[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsResponse, bookingsResponse, pendingResponse] = await Promise.all([
          analyticsApi.getDashboardStats(),
          bookingsApi.getAllBookings({ limit: '5' }),
          usersApi.getPendingUstaadhss(),
        ]);

        if (!isMounted) {
          return;
        }

        setStats(statsResponse);

        const bookingsData = Array.isArray(bookingsResponse?.bookings)
          ? bookingsResponse.bookings
          : Array.isArray(bookingsResponse)
          ? bookingsResponse
          : [];

        const normalizedBookings: DashboardBooking[] = bookingsData.slice(0, 5).map((booking: any) => {
          const student = booking.studentId;
          return {
            id: booking.id || booking._id,
            studentName:
              typeof student === 'object' && student !== null ? student.fullName : booking.studentName || 'Student',
            packageType: booking.packageType,
            amount: booking.totalAmount,
            status: booking.status,
            date: booking.createdAt,
          };
        });

        setRecentBookings(normalizedBookings);

        const pendingUstaadhs = Array.isArray(pendingResponse)
          ? pendingResponse
          : Array.isArray(pendingResponse?.ustaadhs)
          ? pendingResponse.ustaadhs
          : [];

        setPendingApprovals(pendingUstaadhs);
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
          setError(message);
        }
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

  const statsCards = useMemo(() => {
    if (!stats) {
      return [];
    }

    const revenueGrowthChange = getChangeLabel(stats.revenueGrowth);
    const revenueChangeType: ChangeType = stats.revenueGrowth > 0 ? 'positive' : stats.revenueGrowth < 0 ? 'negative' : 'neutral';

    return [
      {
        title: 'Total Students',
        value: stats.totalStudents.toLocaleString(),
        icon: Users,
        color: 'bg-blue-500',
        change: undefined as string | undefined,
        changeType: 'neutral' as ChangeType,
      },
      {
        title: 'Active Ustaadhs',
        value: stats.totalUstaadhss.toLocaleString(),
        icon: BookOpen,
        color: 'bg-green-500',
        change: undefined as string | undefined,
        changeType: 'neutral' as ChangeType,
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(stats.monthlyRevenue),
        icon: DollarSign,
        color: 'bg-yellow-500',
        change: revenueGrowthChange,
        changeType: revenueChangeType,
      },
      {
        title: 'Pending Approvals',
        value: stats.pendingApprovals.toLocaleString(),
        icon: Clock,
        color: 'bg-orange-500',
        change: undefined as string | undefined,
        changeType: 'neutral' as ChangeType,
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <p className="text-sm text-red-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                {stat.change !== undefined && (
                  <div className="flex items-center mt-2">
                    <TrendingUp
                      className={`h-4 w-4 mr-1 ${
                        stat.changeType === 'positive'
                          ? 'text-green-500'
                          : stat.changeType === 'negative'
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.change} this month
                    </span>
                  </div>
                )}
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
          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No bookings recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{booking.studentName}</p>
                    <p className="text-sm text-gray-600">{booking.packageType}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(booking.amount)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
            <Link to="/admin/approvals" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Review All
            </Link>
          </div>
          {pendingApprovals.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No pending ustaadh applications.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((approval) => {
                const approvalId = approval.id || (approval as any)._id || approval.email;
                return (
                  <div
                    key={approvalId}
                    className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{approval.fullName}</p>
                      <p className="text-sm text-gray-600">{approval.country || 'Country not specified'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : '—'}
                      </p>
                      <div className="flex space-x-1 mt-1">
                        <button className="p-1 text-green-600 hover:bg-green-100 rounded" aria-label="Approve">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-100 rounded" aria-label="Reject">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              <p className="text-xs text-orange-600">
                {pendingApprovals.length} ustaadh application{pendingApprovals.length === 1 ? '' : 's'} awaiting review.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Average Rating</p>
              <p className="text-xs text-blue-600">
                Platform-wide average rating is {stats?.averageRating?.toFixed(1) ?? '0.0'} stars.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Revenue Trend</p>
              <p className="text-xs text-green-600">
                Monthly revenue change: {getChangeLabel(stats?.revenueGrowth) ?? 'No change recorded'}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
