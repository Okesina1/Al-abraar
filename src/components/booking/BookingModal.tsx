import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { User } from '../../types';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { availabilityApi } from '../../utils/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ustaadh: User;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, ustaadh }) => {
  const { user } = useAuth();
  const { createBooking, checkTimeSlotAvailability } = useBooking();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    packageType: 'basic' as 'basic' | 'complete',
    hoursPerDay: 1,
    daysPerWeek: 1,
    subscriptionMonths: 1,
    selectedDays: [] as number[],
    selectedTimes: [] as string[],
    startDate: new Date().toISOString().split('T')[0]
  });
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState<Record<string, Array<{ startTime: string; endTime: string }>>>({});

  useEffect(() => {
    // when startDate or selectedDays change, prefetch available slots for those dates
    const fetchForSelected = async () => {
      console.log('[BookingModal] Fetching available slots for selected days');
      const days = bookingData.selectedDays.filter(d => d !== undefined && d !== null);
      for (const d of days) {
        try {
          const date = getNextDateForDay(d, bookingData.startDate);
          console.log(`[BookingModal] Fetching slots for day ${d}, date ${date}`);
          const slots = await availabilityApi.getAvailableTimeSlots(ustaadh.id, date);
          console.log(`[BookingModal] Received slots for ${date}:`, slots);
          setAvailableSlotsByDate(prev => ({ ...prev, [date]: slots || [] }));
        } catch (err) {
          console.error('Failed to fetch available slots for date', err);
        }
      }
    };

    if (bookingData.selectedDays.length > 0) {
      fetchForSelected();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.startDate, bookingData.selectedDays]);

  // Poll available slots while modal is open to reflect live booking state
  useEffect(() => {
    if (!isOpen || bookingData.selectedDays.length === 0) return;
    let active = true;
    const intervalMs = 10000;
    const fetchForSelected = async () => {
      console.log('[BookingModal] Polling available slots...');
      const days = bookingData.selectedDays.filter(d => d !== undefined && d !== null);
      for (const d of days) {
        try {
          const date = getNextDateForDay(d, bookingData.startDate);
          const slots = await availabilityApi.getAvailableTimeSlots(ustaadh.id, date);
          if (!active) return;
          console.log(`[BookingModal] Polling update for ${date}:`, slots);
          setAvailableSlotsByDate(prev => ({ ...prev, [date]: slots || [] }));
        } catch (err) {
          // ignore polling errors
        }
      }
    };

    fetchForSelected();
    const interval = setInterval(fetchForSelected, intervalMs);
    return () => { active = false; clearInterval(interval); };
  }, [isOpen, bookingData.startDate, bookingData.selectedDays, ustaadh.id]);

  // Force refresh when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('[BookingModal] Modal opened, clearing cached slots');
      setAvailableSlotsByDate({});
    }
  }, [isOpen]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const packagePrices = {
    basic: 5, // Qur'an & Tajweed
    complete: 7 // Qur'an, Tajweed, Hadeeth & Arabic
  };

  const calculateTotal = () => {
    const hourlyRate = packagePrices[bookingData.packageType];
    const weeksInMonth = 4;
    return hourlyRate * bookingData.hoursPerDay * bookingData.daysPerWeek * weeksInMonth * bookingData.subscriptionMonths;
  };

  const handleBookingSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate schedule slots matching server DTO (no extra fields)
      const schedule: any[] = bookingData.selectedDays.map((day, index) => {
        const date = getNextDateForDay(day, bookingData.startDate);
        const picked = (availableSlotsByDate[date] || [])[0];
        const start = bookingData.selectedTimes[index] || (picked ? picked.startTime : '14:00');
        const end = addHours(start, bookingData.hoursPerDay);
        return {
          dayOfWeek: Number(day),
          startTime: start,
          endTime: end,
          date,
        };
      });

      // Client-side validation: ensure each selected slot is still available
      for (const s of schedule) {
        const ok = await checkTimeSlotAvailability(ustaadh.id, s.date, s.startTime, s.endTime);
        if (!ok) {
          toast.error(`Selected time ${s.startTime}-${s.endTime} on ${s.date} is no longer available.`);
          setLoading(false);
          return;
        }
      }

      const endDate = new Date(bookingData.startDate);
      endDate.setMonth(endDate.getMonth() + bookingData.subscriptionMonths);

      const reservedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await createBooking({
        studentId: user.id,
        ustaadhId: ustaadh.id,
        packageType: bookingData.packageType,
        hoursPerDay: bookingData.hoursPerDay,
        daysPerWeek: bookingData.daysPerWeek,
        subscriptionMonths: bookingData.subscriptionMonths,
        totalAmount: calculateTotal(),
        startDate: bookingData.startDate,
        endDate: endDate.toISOString().split('T')[0],
        schedule: schedule as any,
        reservedUntil
      } as any);

      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Booking confirmed! You will receive a confirmation email shortly.');
      onClose();
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addHours = (time: string, hours: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + hours * 60;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const getNextDateForDay = (dayOfWeek: number, startDate: string): string => {
    // Validate inputs: if startDate is invalid, fall back to today
    const base = (!startDate || isNaN(new Date(startDate).getTime())) ? new Date() : new Date(startDate);
    if (typeof dayOfWeek !== 'number' || isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      // invalid dayOfWeek - return base date
      return base.toISOString().split('T')[0];
    }

    // compute next date (including same day)
    const currentDow = base.getDay();
    const diff = (dayOfWeek - currentDow + 7) % 7;
    base.setDate(base.getDate() + diff);
    return base.toISOString().split('T')[0];
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Package</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            bookingData.packageType === 'basic' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={() => setBookingData({...bookingData, packageType: 'basic'})}
        >
          <h4 className="font-semibold text-gray-800 mb-2">Qur'an & Tajweed</h4>
          <p className="text-2xl font-bold text-green-600 mb-2">$5/hour</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Qur'an recitation</li>
            <li>• Tajweed rules</li>
            <li>• Pronunciation correction</li>
          </ul>
        </div>

        <div 
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            bookingData.packageType === 'complete' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={() => setBookingData({...bookingData, packageType: 'complete'})}
        >
          <h4 className="font-semibold text-gray-800 mb-2">Complete Package</h4>
          <p className="text-2xl font-bold text-green-600 mb-2">$7/hour</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Qur'an & Tajweed</li>
            <li>• Hadeeth studies</li>
            <li>• Arabic language</li>
            <li>• Islamic studies</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hours per day</label>
          <select 
            value={bookingData.hoursPerDay}
            onChange={(e) => setBookingData({...bookingData, hoursPerDay: parseFloat(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={0.5}>30 minutes</option>
            <option value={1}>1 hour</option>
            <option value={1.5}>1.5 hours</option>
            <option value={2}>2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Days per week</label>
          <select 
            value={bookingData.daysPerWeek}
            onChange={(e) => setBookingData({...bookingData, daysPerWeek: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription (months)</label>
          <select 
            value={bookingData.subscriptionMonths}
            onChange={(e) => setBookingData({...bookingData, subscriptionMonths: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={1}>1 month</option>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-800">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">${calculateTotal()}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          ${packagePrices[bookingData.packageType]}/hr × {bookingData.hoursPerDay}h × {bookingData.daysPerWeek} days × 4 weeks × {bookingData.subscriptionMonths} months
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Schedule & Payment</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
        <input
          type="date"
          value={bookingData.startDate}
          onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Days & Times</label>
        <div className="space-y-3">
          {Array.from({length: bookingData.daysPerWeek}, (_, i) => {
            const selectedDay = bookingData.selectedDays[i];
            const dateForDay = selectedDay !== undefined && selectedDay !== null ? getNextDateForDay(selectedDay, bookingData.startDate) : null;
            const availableSlots = dateForDay ? availableSlotsByDate[dateForDay] || [] : [];

            return (
              <div key={i} className="flex flex-col space-y-2">
                <div className="flex space-x-4">
                  <select 
                    value={bookingData.selectedDays[i] || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      const dayNum = val === '' ? NaN : parseInt(val);
                      const newDays = [...bookingData.selectedDays];
                      newDays[i] = dayNum;
                      setBookingData({...bookingData, selectedDays: newDays});

                      // Only fetch if a valid day is selected
                      if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
                        const date = getNextDateForDay(dayNum, bookingData.startDate);
                        try {
                          const slots = await availabilityApi.getAvailableTimeSlots(ustaadh.id, date);
                          setAvailableSlotsByDate(prev => ({ ...prev, [date]: slots || [] }));
                        } catch (err) {
                          // ignore and keep existing state
                          console.error('Failed to load available slots', err);
                        }
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Day</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                  <div className="flex-1">
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const newTimes = [...bookingData.selectedTimes];
                              newTimes[i] = s.startTime;
                              setBookingData({...bookingData, selectedTimes: newTimes});
                            }}
                            className={`p-2 border rounded-lg text-sm ${bookingData.selectedTimes[i] === s.startTime ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
                          >
                            {s.startTime} - {s.endTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="time"
                        value={bookingData.selectedTimes[i] || ''}
                        onChange={(e) => {
                          const newTimes = [...bookingData.selectedTimes];
                          newTimes[i] = e.target.value;
                          setBookingData({...bookingData, selectedTimes: newTimes});
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>
                </div>
                {dateForDay && availableSlots.length === 0 && (
                  <p className="text-sm text-gray-500">No available slots for the chosen day on {dateForDay} — you can pick a time manually.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Payment Information</h4>
        <p className="text-sm text-yellow-700">
          You will be redirected to our secure payment processor to complete your subscription.
          Your lessons will be confirmed once payment is processed.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Book Lesson with {ustaadh.fullName}</h2>
              <p className="text-gray-600 text-sm sm:text-base">{ustaadh.city}, {ustaadh.country}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>

        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 sm:ml-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>{loading ? 'Processing...' : 'Confirm & Pay'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
