import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, ScheduleSlot, UstaadhAvailability } from '../types';

interface BookingContextType {
  bookings: Booking[];
  availability: UstaadhAvailability[];
  createBooking: (bookingData: Partial<Booking>) => Promise<string>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  getUstaadhAvailability: (ustaadhId: string) => UstaadhAvailability[];
  setUstaadhAvailability: (ustaadhId: string, availability: UstaadhAvailability[]) => Promise<void>;
  getBookingsByUser: (userId: string, role: string) => Booking[];
  checkTimeSlotAvailability: (ustaadhId: string, date: string, startTime: string, endTime: string) => boolean;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      studentId: '3',
      ustaadhId: '2',
      packageType: 'complete',
      hoursPerDay: 1.5,
      daysPerWeek: 3,
      subscriptionMonths: 1,
      totalAmount: 126, // $7 * 1.5 * 3 * 4 weeks
      status: 'confirmed',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      schedule: [
        {
          id: 's1',
          dayOfWeek: 1,
          startTime: '14:00',
          endTime: '15:30',
          status: 'scheduled',
          date: '2024-01-15',
          meetingLink: 'https://meet.google.com/abc-def-ghi'
        },
        {
          id: 's2',
          dayOfWeek: 3,
          startTime: '16:00',
          endTime: '17:30',
          status: 'scheduled',
          date: '2024-01-17',
          meetingLink: 'https://meet.google.com/def-ghi-jkl'
        },
        {
          id: 's3',
          dayOfWeek: 5,
          startTime: '18:00',
          endTime: '19:30',
          status: 'scheduled',
          date: '2024-01-19',
          meetingLink: 'https://meet.google.com/ghi-jkl-mno'
        }
      ],
      paymentStatus: 'paid',
      createdAt: '2024-01-10T10:00:00Z'
    }
  ]);

  const [availability, setAvailability] = useState<UstaadhAvailability[]>([
    { ustaadhId: '2', dayOfWeek: 1, startTime: '14:00', endTime: '20:00', isAvailable: true },
    { ustaadhId: '2', dayOfWeek: 2, startTime: '14:00', endTime: '20:00', isAvailable: true },
    { ustaadhId: '2', dayOfWeek: 3, startTime: '14:00', endTime: '20:00', isAvailable: true },
    { ustaadhId: '2', dayOfWeek: 4, startTime: '14:00', endTime: '20:00', isAvailable: true },
    { ustaadhId: '2', dayOfWeek: 5, startTime: '14:00', endTime: '18:00', isAvailable: true },
    { ustaadhId: '2', dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: true }
  ]);

  const createBooking = async (bookingData: Partial<Booking>): Promise<string> => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      studentId: bookingData.studentId || '',
      ustaadhId: bookingData.ustaadhId || '',
      packageType: bookingData.packageType || 'basic',
      hoursPerDay: bookingData.hoursPerDay || 1,
      daysPerWeek: bookingData.daysPerWeek || 1,
      subscriptionMonths: bookingData.subscriptionMonths || 1,
      totalAmount: bookingData.totalAmount || 0,
      status: 'pending',
      startDate: bookingData.startDate || new Date().toISOString().split('T')[0],
      endDate: bookingData.endDate || '',
      schedule: bookingData.schedule || [],
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);
    return newBooking.id;
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const, paymentStatus: 'refunded' as const }
        : booking
    ));
  };

  const getUstaadhAvailability = (ustaadhId: string): UstaadhAvailability[] => {
    return availability.filter(slot => slot.ustaadhId === ustaadhId);
  };

  const setUstaadhAvailability = async (ustaadhId: string, newAvailability: UstaadhAvailability[]) => {
    setAvailability(prev => [
      ...prev.filter(slot => slot.ustaadhId !== ustaadhId),
      ...newAvailability
    ]);
  };

  const getBookingsByUser = (userId: string, role: string): Booking[] => {
    if (role === 'student') {
      return bookings.filter(booking => booking.studentId === userId);
    } else if (role === 'ustaadh') {
      return bookings.filter(booking => booking.ustaadhId === userId);
    }
    return bookings;
  };

  const checkTimeSlotAvailability = (ustaadhId: string, date: string, startTime: string, endTime: string): boolean => {
    const dayOfWeek = new Date(date).getDay();
    const ustaadhAvailability = availability.find(slot => 
      slot.ustaadhId === ustaadhId && 
      slot.dayOfWeek === dayOfWeek &&
      slot.isAvailable
    );

    if (!ustaadhAvailability) return false;

    // Check if requested time is within available hours
    if (startTime < ustaadhAvailability.startTime || endTime > ustaadhAvailability.endTime) {
      return false;
    }

    // Check for conflicts with existing bookings
    const conflictingBookings = bookings.filter(booking => 
      booking.ustaadhId === ustaadhId &&
      booking.status === 'confirmed' &&
      booking.schedule.some(slot => 
        slot.date === date &&
        ((startTime >= slot.startTime && startTime < slot.endTime) ||
         (endTime > slot.startTime && endTime <= slot.endTime) ||
         (startTime <= slot.startTime && endTime >= slot.endTime))
      )
    );

    return conflictingBookings.length === 0;
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      availability,
      createBooking,
      updateBooking,
      cancelBooking,
      getUstaadhAvailability,
      setUstaadhAvailability,
      getBookingsByUser,
      checkTimeSlotAvailability
    }}>
      {children}
    </BookingContext.Provider>
  );
};