import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
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
  setUstaadhAvailability: (ustaadhId: string, availability: UstaadhAvailability[]) => Promise<any>;
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
  const { user } = useAuth();

  const refreshBookings = useCallback(async () => {
    const token = localStorage.getItem('al-abraar-token');
    if (!token) return;
    try {
      setLoading(true);
      const response = await bookingsApi.getMyBookings();
      setBookings(response.bookings || response);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshBookings();
    }
  }, [user, refreshBookings]);

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

  const getUstaadhAvailability = useCallback(async (ustaadhId: string): Promise<UstaadhAvailability[]> => {
    if (!ustaadhId) {
      console.warn('getUstaadhAvailability called with falsy ustaadhId');
      setAvailability([]);
      return [];
    }
    console.debug('[BookingContext] getUstaadhAvailability id=', ustaadhId);
    try {
      const response = await availabilityApi.getAvailability(ustaadhId);
      const availabilityData = response.availability || response;
      setAvailability(availabilityData);
      return availabilityData;
    } catch (error: any) {
      console.error('Failed to fetch availability:', error);
      return [];
    }
  }, [setAvailability]);

  const setUstaadhAvailability = useCallback(async (ustaadhId: string, newAvailability: UstaadhAvailability[]) => {
    if (!ustaadhId) {
      throw new Error('Missing ustaadhId when setting availability');
    }
    try {
      // return server response so callers can immediately use persisted documents
      const response = await availabilityApi.setAvailability(newAvailability);
      // refresh cached availability afterwards to ensure consistency
      try {
        await getUstaadhAvailability(ustaadhId);
      } catch (e) {
        // ignore refresh errors here; caller may handle
      }
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to set availability');
    }
  }, [getUstaadhAvailability]);

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
