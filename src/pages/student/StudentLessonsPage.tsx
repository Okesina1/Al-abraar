import React from 'react';
import { LessonHistory } from '../../components/student/LessonHistory';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

export const StudentLessonsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();

  const bookings = user ? getBookingsByUser(user.id, 'student') : [];

  const handleRateLesson = (bookingId: string, rating: number, comment: string) => {
    // In a real app, this would call an API to submit the rating
    console.log('Rating submitted:', { bookingId, rating, comment });
    alert('Thank you for your rating!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
      </div>

      <LessonHistory bookings={bookings} onRateLesson={handleRateLesson} />
    </div>
  );
};