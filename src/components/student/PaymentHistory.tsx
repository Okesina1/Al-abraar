import React, { useState } from 'react';
import React, { useState } from 'react';
import { CreditCard, Download, Search, Filter, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Booking } from '../../types';

interface PaymentHistoryProps {
  bookings: Booking[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ bookings }) => {
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.paymentStatus === statusFilter;
    const matchesDate = !dateFilter || booking.createdAt.startsWith(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalSpent = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingPayments = bookings
    .filter(b => b.paymentStatus === 'pending')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const failedPayments = bookings.filter(b => b.paymentStatus === 'failed').length;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded': return <DollarSign className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const downloadReceipt = (bookingId: string) => {
    // In a real app, this would generate and download a PDF receipt
    success(`Starting receipt download for booking ${bookingId}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingPayments.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredBookings.length} payment{filteredBookings.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package'}
                      </h4>
                      <p className="text-gray-600">Booking #{booking.id}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>{booking.subscriptionMonths} month{booking.subscriptionMonths > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-800">${booking.totalAmount}</p>
                      <div className="flex items-center space-x-2">
                        {getPaymentStatusIcon(booking.paymentStatus)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {booking.paymentStatus === 'paid' && (
                      <button
                        onClick={() => downloadReceipt(booking.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 pl-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Duration:</span> {booking.hoursPerDay}h/day × {booking.daysPerWeek} days/week
                  </div>
                  <div>
                    <span className="font-medium">Period:</span> {booking.startDate} to {booking.endDate}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {booking.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Payment Methods Used</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Credit Card</span>
                <span className="font-medium">{bookings.filter(b => b.paymentStatus === 'paid').length}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Monthly Spending</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium text-green-600">
                  ${bookings
                    .filter(b => b.paymentStatus === 'paid' && 
                      new Date(b.createdAt).getMonth() === new Date().getMonth())
                    .reduce((sum, b) => sum + b.totalAmount, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average per Month</span>
                <span className="font-medium">
                  ${Math.round(totalSpent / Math.max(1, bookings.length))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
