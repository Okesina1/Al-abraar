import React from 'react';
import { AvailabilityCalendar } from '../../components/calendar/AvailabilityCalendar';

export const UstaadhSchedulePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
      </div>

      <AvailabilityCalendar />
    </div>
  );
};