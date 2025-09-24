import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Clock, Users } from 'lucide-react';
import { Booking } from '../../types';

interface EarningsTrackerProps {
  bookings: Booking[];
}

export const EarningsTracker: React.FC<EarningsTrackerProps> = ({ bookings }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate earnings
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
  const totalEarnings = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  
  // Assuming 70% goes to Ustaadh, 30% platform fee
  const platformFeeRate = 0.30;
  const ustaadhEarnings = totalEarnings * (1 - platformFeeRate);
  const platformFees = totalEarnings * platformFeeRate;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthEarnings = paidBookings
    .filter(b => {
      const bookingDate = new Date(b.createdAt);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    })
    .reduce((sum, b) => sum + b.totalAmount, 0) * (1 - platformFeeRate);

  const lastMonthEarnings = paidBookings
    .filter(b => {
      const bookingDate = new Date(b.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, b) => sum + b.totalAmount, 0) * (1 - platformFeeRate);

  const growthRate = lastMonthEarnings > 0 
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
    : 0;

  // Mock monthly data for chart
  const monthlyData = [
    { month: 'Jan', earnings: 850 },
    { month: 'Feb', earnings: 1200 },
    { month: 'Mar', earnings: 980 },
    { month: 'Apr', earnings: 1450 },
    { month: 'May', earnings: 1680 },
    { month: 'Jun', earnings: 1920 },
  ];

  const pendingPayouts = bookings
    .filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0) * (1 - platformFeeRate);

  const totalStudents = new Set(bookings.map(b => b.studentId)).size;
  const activeSubscriptions = bookings.filter(b => b.status === 'confirmed').length;

  const downloadEarningsReport = () => {
    // In a real app, this would generate and download a PDF report
    alert('Downloading earnings report...');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">${ustaadhEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">After platform fees</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-blue-600">${thisMonthEarnings.toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className={`h-3 w-3 mr-1 ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingPayouts.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Next payout: 1st</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-purple-600">{totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1">{activeSubscriptions} subscriptions</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Earnings Overview</h3>
          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={downloadEarningsReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 text-sm text-gray-600">{data.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="bg-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${(data.earnings / 2000) * 100}%` }}
                >
                  <span className="text-white text-xs font-medium">${data.earnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Gross Revenue</p>
                  <p className="text-sm text-gray-600">Before platform fees</p>
                </div>
              </div>
              <span className="font-semibold text-green-600">${totalEarnings.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Platform Fees</p>
                  <p className="text-sm text-gray-600">{(platformFeeRate * 100)}% of gross revenue</p>
                </div>
              </div>
              <span className="font-semibold text-red-600">-${platformFees.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Net Earnings</p>
                  <p className="text-sm text-gray-600">Your total earnings</p>
                </div>
              </div>
              <span className="font-semibold text-blue-600">${ustaadhEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Schedule</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">Next Payout</span>
                <span className="text-sm text-gray-600">January 1st, 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-green-600">${pendingPayouts.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Payout Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Payouts are processed monthly on the 1st</li>
                <li>• Minimum payout amount: $50</li>
                <li>• Processing time: 3-5 business days</li>
                <li>• Payment method: Bank transfer</li>
              </ul>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">Last Payout</span>
                <span className="text-sm text-gray-600">December 1st, 2023</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-800">${lastMonthEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paidBookings.slice(0, 5).map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    Student #{booking.studentId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.totalAmount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${(booking.totalAmount * (1 - platformFeeRate)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};