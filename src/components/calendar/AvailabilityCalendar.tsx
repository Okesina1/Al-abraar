import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { UstaadhAvailability } from '../../types';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { availabilityApi } from '../../utils/api';

export const AvailabilityCalendar: React.FC = () => {
  const { user } = useAuth();
  const { getUstaadhAvailability, setUstaadhAvailability } = useBooking();
  const [availability, setAvailability] = useState<UstaadhAvailability[]>([]);
  const toast = useToast();
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingAvailability(true);
      const uId = user?.id;
      if (!uId) {
        if (active) setAvailability([]);
        setLoadingAvailability(false);
        return;
      }
      try {
        const data = await getUstaadhAvailability(uId);
        if (!active) return;
        setAvailability(data);
      } catch (err) {
        console.error('Failed to load availability:', err);
        toast.error('Failed to load availability');
      } finally {
        if (active) setLoadingAvailability(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user?.id, getUstaadhAvailability]);

  // Helper to compute next date for a given dayOfWeek relative to base (today)
  const getNextDateForDay = (dayOfWeek: number, baseDate?: Date) => {
    const base = baseDate ? new Date(baseDate) : new Date();
    const currentDow = base.getDay();
    const diff = (dayOfWeek - currentDow + 7) % 7;
    base.setDate(base.getDate() + diff);
    return base.toISOString().split('T')[0];
  };

  // When not editing, fetch date-specific available slots and booked slots for next occurrence of each weekday
  useEffect(() => {
    if (isEditing) return;
    let active = true;
    let interval: any = null;

    const fetchForWeek = async () => {
      const uId = user?.id || (user as any)?._id;
      if (!uId) return;

      const newDateSlots: Record<string, Array<{ startTime: string; endTime: string }>> = {};
      const newBooked: Record<string, Array<{ startTime: string; endTime: string; reserved?: boolean }>> = {};

      for (const d of daysOfWeek) {
        try {
          const date = getNextDateForDay(d.id);
          const slots = await (await import('../../utils/api')).availabilityApi.getAvailableTimeSlots(uId, date);
          newDateSlots[date] = slots || [];
          const booked = await (await import('../../utils/api')).availabilityApi.getAvailability(uId).then(() => [] as any).catch(() => []);
          // prefer booked from dedicated endpoint
          try {
            const b = await (await import('../../utils/api')).apiClient.get(`/availability/booked?ustaadhId=${uId}&date=${date}`);
            newBooked[date] = b || [];
          } catch (e) {
            // fallback: empty
            newBooked[date] = [];
          }
        } catch (e) {
          console.error('Failed to fetch date slots for calendar', e);
        }
      }

      if (!active) return;
      setDateSlots(newDateSlots);
      setBookedByDate(newBooked);
    };

    // initial fetch and polling
    fetchForWeek();
    interval = setInterval(fetchForWeek, 15000);

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [isEditing, user?.id]);
  const [isEditing, setIsEditing] = useState(false);
  const [dateSlots, setDateSlots] = useState<Record<string, Array<{ startTime: string; endTime: string }>>>({});
  const [bookedByDate, setBookedByDate] = useState<Record<string, Array<{ startTime: string; endTime: string; reserved?: boolean }>>>({});

  const daysOfWeek = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' }
  ];

  const addTimeSlot = (dayOfWeek: number) => {
    const uId = user?.id || (user as any)?._id || '';
    const newSlot: UstaadhAvailability = {
      ustaadhId: uId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    };
    setAvailability([...availability, newSlot]);
  };

  const normalizeTime = (raw: string) => {
    if (!raw) return raw;
    const t = raw.trim();
    // accept H:MM or HH:MM and always return HH:MM zero-padded
    const parts = t.split(':');
    if (parts.length !== 2) return t;
    const hh = parts[0].replace(/^0+/, '') === '' ? '0' : parts[0].replace(/^0+/, '') ;
    const mm = parts[1];
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return t;
    const hhStr = Math.max(0, Math.min(23, h)).toString().padStart(2, '0');
    const mmStr = Math.max(0, Math.min(59, m)).toString().padStart(2, '0');
    return `${hhStr}:${mmStr}`;
  };

  const isValidTimeFormat = (t?: string) => {
    if (!t) return false;
    return /^\d{2}:\d{2}$/.test(t);
  };

  const updateTimeSlot = (index: number, field: keyof UstaadhAvailability, value: any) => {
    const updated = [...availability];
    let newValue = value;
    if ((field === 'startTime' || field === 'endTime') && typeof value === 'string') {
      newValue = normalizeTime(value);
    }
    updated[index] = { ...updated[index], [field]: newValue };
    setAvailability(updated);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const confirmRemove = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return;
    removeTimeSlot(deleteIndex);
    setDeleteIndex(null);
    setShowDeleteConfirm(false);
  };

  const saveAvailability = async () => {
    const uId = user?.id || (user as any)?._id || '';
    if (!uId) {
      toast.error('Unable to save availability: missing user id');
      return;
    }
    if (user) {
      const previous = [...availability];
      // optimistic update: assume save will succeed and keep local state
      setSaveLoading(true);
        try {
          // Validation: ensure start < end, valid formats, and no overlapping slots per day
          const parseTime = (t: string) => {
            const [hh, mm] = t.split(':').map((p) => parseInt(p, 10));
            return hh * 60 + mm;
          };

          const formatErrors: string[] = [];
          const overlapErrors: string[] = [];

          for (const day of [0,1,2,3,4,5,6]) {
            const slots = availability
              .map((s, idx) => ({...s, __idx: idx}))
              .filter((s) => s.dayOfWeek === day);

            // check formats and start < end
            for (const s of slots) {
              if (!isValidTimeFormat(s.startTime) || !isValidTimeFormat(s.endTime)) {
                formatErrors.push(`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}: ${s.startTime || '—'} - ${s.endTime || '—'}`);
              } else {
                const start = parseTime(s.startTime || '00:00');
                const end = parseTime(s.endTime || '00:00');
                if (start >= end) {
                  formatErrors.push(`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}: ${s.startTime} - ${s.endTime}`);
                }
              }
            }

            // check overlap
            const sorted = slots
              .filter((s) => isValidTimeFormat(s.startTime) && isValidTimeFormat(s.endTime))
              .sort((a,b) => parseTime(a.startTime) - parseTime(b.startTime));
            for (let i=1;i<sorted.length;i++) {
              const prevEnd = parseTime(sorted[i-1].endTime);
              const curStart = parseTime(sorted[i].startTime);
              if (curStart < prevEnd) {
                overlapErrors.push(`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}: ${sorted[i-1].startTime}-${sorted[i-1].endTime} overlaps ${sorted[i].startTime}-${sorted[i].endTime}`);
              }
            }
          }

          if (formatErrors.length > 0) {
            toast.error(`Fix invalid time formats or ranges: ${formatErrors.slice(0,2).join('; ')}`);
            return;
          }
          if (overlapErrors.length > 0) {
            toast.error(`Fix overlapping slots: ${overlapErrors.slice(0,2).join('; ')}`);
            return;
          }

        // send payload and use server response immediately
        const payload = availability.map(a => ({ ...a }));
        const serverResult = await setUstaadhAvailability(uId, payload);
        console.debug('Availability save payload', payload);
        console.debug('Availability server result', serverResult);
        // If server returned inserted documents, use them to update UI immediately
        if (Array.isArray(serverResult) && serverResult.length > 0) {
          setAvailability(serverResult);
        }
        // refetch fresh data from backend to ensure UI reflects persisted state (secondary confirmation)
        try {
          const fresh = await getUstaadhAvailability(uId);
          console.debug('Availability fresh after save', fresh);
          setAvailability(fresh);
        } catch (e) {
          // ignore; booking context already logged
        }
        setIsEditing(false);
        toast.success('Availability saved');
        } catch (err) {
          console.error('Failed to save availability:', err);
          const message = err instanceof Error ? err.message : 'Failed to save availability';
          // revert optimistic update
          setAvailability(previous);
          toast.error(message);
        } finally {
          setSaveLoading(false);
        }
    }
  };

  const getDayAvailability = (dayId: number) => {
    return availability.filter(slot => slot.dayOfWeek === dayId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Weekly Availability</h2>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saveLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : 'Cancel'}
              </button>
              <button
                onClick={saveAvailability}
                disabled={saveLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loadingAvailability}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loadingAvailability ? 'Loading...' : 'Edit Availability'}
            </button>
          )}
        </div>
      </div>

      {loadingAvailability ? (
        <div className="py-12 flex items-center justify-center">
          <div className="text-sm text-gray-600">Loading availability...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const daySlots = getDayAvailability(day.id);
          const date = getNextDateForDay(day.id);
          const dateFree = dateSlots[date] || [];
          const dateBooked = bookedByDate[date] || [];

          // choose which slots to render: when editing show weekly slots, otherwise show date-specific free slots
          const slotsToRender = isEditing ? daySlots : dateFree;

          return (
            <div key={day.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">
                {day.name}
                {!isEditing && (
                  <div className="text-xs text-gray-500 mt-1">{date}</div>
                )}
              </h3>

              <div className="space-y-2">
                {slotsToRender.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Not Available</p>
                  </div>
                ) : (
                  slotsToRender.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => 
                      s.dayOfWeek === slot.dayOfWeek && 
                      s.startTime === slot.startTime && 
                      s.endTime === slot.endTime
                    );

                    const startOk = isValidTimeFormat(slot.startTime);
                    const endOk = isValidTimeFormat(slot.endTime);
                    let rangeOk = false;
                    if (startOk && endOk) {
                      const [sh, sm] = slot.startTime.split(':').map(Number);
                      const [eh, em] = slot.endTime.split(':').map(Number);
                      const startM = sh * 60 + sm;
                      const endM = eh * 60 + em;
                      rangeOk = startM < endM;
                    }

                    const slotInvalid = !(startOk && endOk && rangeOk);

                    return (
                      <div key={index} className={`p-3 rounded-lg ${slotInvalid ? 'bg-red-50 border border-red-300' : 'bg-green-50 border border-green-200'}`}>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(globalIndex, 'startTime', e.target.value)}
                                className={`text-xs p-1 rounded ${!isValidTimeFormat(slot.startTime) ? 'border border-red-400' : 'border border-gray-300'}`}
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(globalIndex, 'endTime', e.target.value)}
                                className={`text-xs p-1 rounded ${!isValidTimeFormat(slot.endTime) ? 'border border-red-400' : 'border border-gray-300'}`}
                              />
                            </div>
                            {!rangeOk && startOk && endOk && (
                              <div className="text-xs text-red-600">Start must be before end</div>
                            )}
                            {(!startOk || !endOk) && (
                              <div className="text-xs text-red-600">Invalid time format (use HH:MM)</div>
                            )}
                            <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  checked={slot.isAvailable}
                                  onChange={(e) => updateTimeSlot(globalIndex, 'isAvailable', e.target.checked)}
                                  className="text-green-600"
                                />
                                <span className="text-xs text-gray-600">Available</span>
                              </label>
                              <button
                                onClick={() => confirmRemove(globalIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className={`text-sm font-medium ${slotInvalid ? 'text-red-800' : 'text-green-800'}`}>
                              {slot.startTime} - {slot.endTime}
                            </p>
                            <p className={`text-xs ${slot.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                              {slot.isAvailable ? 'Available' : 'Unavailable'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                
                {isEditing && (
                  <button
                    onClick={() => addTimeSlot(day.id)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-300 hover:text-green-600 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">Add Time</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Availability Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Set consistent hours to help students plan their schedule</li>
            <li>��� Update your availability regularly to avoid booking conflicts</li>
            <li>• Consider different time zones when setting your hours</li>
            <li>• Block out time for breaks between lessons</li>
          </ul>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">Are you sure you want to delete this time slot? This action cannot be undone.</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteIndex(null); }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
