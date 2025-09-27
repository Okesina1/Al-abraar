import React from 'react';
import { PaymentHistory } from '../../components/student/PaymentHistory';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

export const StudentPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();

  const bookings = user ? getBookingsByUser(user.id, 'student') : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      </div>

      <PaymentHistory bookings={bookings} />
    </div>
  );
};