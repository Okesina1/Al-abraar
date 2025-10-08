import React, { useEffect, useState } from 'react';
import { Users, DollarSign, Star, Calendar, BookOpen } from 'lucide-react';
import { analyticsApi } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';




export const AdminReportsPage: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [topUstaadhs, setTopUstaadhs] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [dashboard, revenue, top, growthMetrics] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getRevenueAnalytics('6m'),
          analyticsApi.getTopUstaadhs(10),
          analyticsApi.getGrowthMetrics(),
        ]);

        if (!active) return;

        // build KPI cards from dashboard
        const k = [
          { title: 'Active Students', value: dashboard.totalStudents.toLocaleString(), change: `${dashboard.studentGrowth ?? 0}%`, color: 'bg-green-500', icon: Users },
          { title: 'Active Ustaadhs', value: dashboard.totalUstaadhss.toLocaleString(), change: `${dashboard.ustaadhGrowth ?? 0}%`, color: 'bg-blue-500', icon: BookOpen },
          { title: 'Monthly Revenue', value: `$${dashboard.monthlyRevenue.toLocaleString()}`, change: `${dashboard.revenueGrowth}%`, color: 'bg-yellow-500', icon: DollarSign },
          { title: 'Avg. Rating', value: `${dashboard.averageRating}/5`, change: `+0`, color: 'bg-purple-500', icon: Star }
        ];

        setKpis(k);
        setTopUstaadhs(Array.isArray(top) ? top : []);
        setMonthlySummary(Array.isArray(revenue) ? revenue : []);
        setGrowth(growthMetrics || null);
      } catch (err: any) {
        console.error('Failed to load reports', err);
        toast.error('Failed to load reports');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [toast]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                <p className="text-xs mt-2 text-green-600">{kpi.change} this month</p>
              </div>
              <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue and Bookings (simple cards to avoid charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Bookings</h3>
          <div className="space-y-3">
            {monthlySummary.map((m: any) => (
              <div key={m.date || m.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">{m.month}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{m.bookings} bookings</div>
                  <div className="text-sm text-gray-500">${m.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Ustaadhs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ustaadh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topUstaadhs.map((u: any) => (
                  <tr key={u._id || u.fullName} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{u.fullName || u.name}</div>
                      <div className="text-sm text-gray-500">{u.country || u.city}</div>
                    </td>
                    <td className="px-4 py-3">{u.studentCount || u.students || '—'}</td>
                    <td className="px-4 py-3">{u.rating || '—'}</td>
                    <td className="px-4 py-3">${u.earnings || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Student Growth</div>
            <div className="text-2xl font-bold text-green-700 mt-1">{growth?.studentGrowth ?? '+0'}%</div>
            <div className="text-xs text-gray-500 mt-1">vs last month</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Ustaadh Growth</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{growth?.ustaadhGrowth ?? '+0'}%</div>
            <div className="text-xs text-gray-500 mt-1">vs last month</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600">Revenue Growth</div>
            <div className="text-2xl font-bold text-yellow-700 mt-1">{Number.isFinite(parseFloat((kpis[2]?.change || '0').toString().replace('%',''))) ? kpis[2]?.change : '+0'}</div>
            <div className="text-xs text-gray-500 mt-1">vs last month</div>
          </div>
        </div>
      </div>
    </div>
  );
};
