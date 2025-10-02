import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Booking, UstaadhAvailability } from '../types';
import { bookingsApi, availabilityApi } from '../utils/api';

interface BookingContextType {
  bookings: Booking[];
  availability: UstaadhAvailability[];
  loading: boolean;
  createBooking: (bookingData: Partial<Booking>) => Promise<string>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  getUstaadhAvailability: (ustaadhId: string) => Promise<UstaadhAvailability[]>;
  setUstaadhAvailability: (ustaadhId: string, availability: UstaadhAvailability[]) => Promise<void>;
  refreshBookings: () => Promise<void>;
  checkTimeSlotAvailability: (ustaadhId: string, date: string, startTime: string, endTime: string) => Promise<boolean>;
  getBookingsByUser: (userId: string, role: 'student' | 'ustaadh') => Booking[];
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<UstaadhAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshBookings();
  }, []);

  const refreshBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getMyBookings();
      setBookings(response.bookings || response);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Partial<Booking>): Promise<string> => {
    try {
      const response = await bookingsApi.createBooking(bookingData);
      await refreshBookings();
      return response.id || response._id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create booking');
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      await bookingsApi.updateBooking(bookingId, updates);
      await refreshBookings();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update booking');
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    try {
      await bookingsApi.cancelBooking(bookingId, reason);
      await refreshBookings();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel booking');
    }
  };

  const getUstaadhAvailability = async (ustaadhId: string): Promise<UstaadhAvailability[]> => {
    try {
      const response = await availabilityApi.getAvailability(ustaadhId);
      const availabilityData = response.availability || response;
      setAvailability(availabilityData);
      return availabilityData;
    } catch (error: any) {
      console.error('Failed to fetch availability:', error);
      return [];
    }
  };

  const setUstaadhAvailability = async (ustaadhId: string, newAvailability: UstaadhAvailability[]) => {
    try {
      await availabilityApi.setAvailability(newAvailability);
      await getUstaadhAvailability(ustaadhId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to set availability');
    }
  };

  const checkTimeSlotAvailability = async (
    ustaadhId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    try {
      const response = await availabilityApi.checkSlotAvailability(ustaadhId, date, startTime, endTime);
      return response.available || false;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return false;
    }
  };

  const getId = (ref: any): string | undefined => {
    if (ref && typeof ref === 'object') {
      return ref.id || ref._id || ref.userId;
    }
    return typeof ref === 'string' ? ref : undefined;
  };

  const getBookingsByUser = (userId: string, role: 'student' | 'ustaadh'): Booking[] => {
    return bookings.filter((b) => {
      const studentId = getId(b.studentId);
      const ustaadhId = getId(b.ustaadhId);
      return role === 'student' ? studentId === userId : ustaadhId === userId;
    });
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      availability,
      loading,
      createBooking,
      updateBooking,
      cancelBooking,
      getUstaadhAvailability,
      setUstaadhAvailability,
      refreshBookings,
      checkTimeSlotAvailability,
      getBookingsByUser
    }}>
      {children}
    </BookingContext.Provider>
  );
};
