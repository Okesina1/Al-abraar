import React, { useState } from 'react';
import { StudentManagement } from '../../components/ustaadh/StudentManagement';
import { MessageCenter } from '../../components/messaging/MessageCenter';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

export const UstaadhStudentsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{id: string, name: string} | null>(null);

  const bookings = user ? getBookingsByUser(user.id, 'ustaadh') : [];

  const handleMessageStudent = (studentId: string, studentName: string) => {
    setMessageRecipient({ id: studentId, name: studentName });
    setShowMessageCenter(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
      </div>

      <StudentManagement bookings={bookings} onMessageStudent={handleMessageStudent} />

      {showMessageCenter && (
        <MessageCenter
          isOpen={showMessageCenter}
          onClose={() => {
            setShowMessageCenter(false);
            setMessageRecipient(null);
          }}
          recipientId={messageRecipient?.id}
          recipientName={messageRecipient?.name}
        />
      )}
    </div>
  );
};