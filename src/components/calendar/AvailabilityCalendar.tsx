import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { UstaadhAvailability } from '../../types';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';

export const AvailabilityCalendar: React.FC = () => {
  const { user } = useAuth();
  const { getUstaadhAvailability, setUstaadhAvailability } = useBooking();
  const [availability, setAvailability] = useState<UstaadhAvailability[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        if (active) setAvailability([]);
        return;
      }
      const data = await getUstaadhAvailability(user.id);
      if (active) setAvailability(data);
    };
    load();
    return () => { active = false; };
  }, [user, getUstaadhAvailability]);
  const [isEditing, setIsEditing] = useState(false);

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
    const newSlot: UstaadhAvailability = {
      ustaadhId: user?.id || '',
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true
    };
    setAvailability([...availability, newSlot]);
  };

  const updateTimeSlot = (index: number, field: keyof UstaadhAvailability, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (user) {
      await setUstaadhAvailability(user.id, availability);
      setIsEditing(false);
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
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAvailability}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Availability
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const daySlots = getDayAvailability(day.id);
          
          return (
            <div key={day.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">
                {day.name}
              </h3>
              
              <div className="space-y-2">
                {daySlots.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Not Available</p>
                  </div>
                ) : (
                  daySlots.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => 
                      s.dayOfWeek === slot.dayOfWeek && 
                      s.startTime === slot.startTime && 
                      s.endTime === slot.endTime
                    );
                    
                    return (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(globalIndex, 'startTime', e.target.value)}
                                className="text-xs p-1 border border-gray-300 rounded"
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(globalIndex, 'endTime', e.target.value)}
                                className="text-xs p-1 border border-gray-300 rounded"
                              />
                            </div>
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
                                onClick={() => removeTimeSlot(globalIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-800">
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

      {!isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Availability Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Set consistent hours to help students plan their schedule</li>
            <li>• Update your availability regularly to avoid booking conflicts</li>
            <li>• Consider different time zones when setting your hours</li>
            <li>• Block out time for breaks between lessons</li>
          </ul>
        </div>
      )}
    </div>
  );
};
