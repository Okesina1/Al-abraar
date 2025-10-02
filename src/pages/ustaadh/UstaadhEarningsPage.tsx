import React, { useEffect, useState } from 'react';
import { EarningsTracker } from '../../components/ustaadh/EarningsTracker';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePayroll } from '../../contexts/PayrollContext';
import { CompensationPlan } from '../../types';

export const UstaadhEarningsPage: React.FC = () => {
  const { user } = useAuth();
  const { getBookingsByUser } = useBooking();
  const { getCompensationPlanForUstaadh } = usePayroll();

  const bookings = user ? getBookingsByUser(user.id, 'ustaadh') : [];
  const [compensationPlan, setCompensationPlan] = useState<CompensationPlan | null>(null);

  useEffect(() => {
    let active = true;
    const loadPlan = async () => {
      if (!user) {
        if (active) setCompensationPlan(null);
        return;
      }
      const plan = await getCompensationPlanForUstaadh(user.id);
      if (active) setCompensationPlan(plan);
    };
    loadPlan();
    return () => {
      active = false;
    };
  }, [user, getCompensationPlanForUstaadh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Analytics</h1>
      </div>

      <EarningsTracker bookings={bookings} compensationPlan={compensationPlan} />
    </div>
  );
};
