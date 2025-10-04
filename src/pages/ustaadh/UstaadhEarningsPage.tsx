import React, { useEffect, useState } from "react";
import { EarningsTracker } from "../../components/ustaadh/EarningsTracker";
import { useBooking } from "../../contexts/BookingContext";
import { useAuth } from "../../contexts/AuthContext";
import { usePayroll } from "../../contexts/hooks/usePayroll";
import {
  CompensationPlan,
  Booking,
  SalaryRecord,
  SalaryAdjustment,
} from "../../types";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

export const UstaadhEarningsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    bookings: contextBookings,
    refreshBookings,
    loading: bookingsLoading,
  } = useBooking();
  const { getCompensationPlanForUstaadh } = usePayroll();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [compensationPlan, setCompensationPlan] =
    useState<CompensationPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Helper to extract id from possible populated reference
  const extractId = (
    ref:
      | string
      | { id?: string; _id?: string; userId?: string }
      | null
      | undefined
  ): string | undefined => {
    if (!ref) return undefined;
    if (typeof ref === "string") return ref;
    if (typeof ref === "object") return ref.id || ref._id || ref.userId;
    return undefined;
  };

  // Ensure we have fresh bookings from the backend for this ustaadh
  useEffect(() => {
    if (user) {
      refreshBookings().catch((e) =>
        console.error("Failed to refresh bookings:", e)
      );
    }
  }, [user, refreshBookings]);

  // Derive bookings for the current ustaadh whenever context bookings update
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    const myBookings = contextBookings.filter(
      (b) => extractId(b.ustaadhId) === user.id
    );
    setBookings(myBookings);
  }, [contextBookings, user]);

  // Load compensation plan for the current ustaadh
  useEffect(() => {
    let active = true;
    const loadPlan = async () => {
      if (!user) {
        if (active) setCompensationPlan(null);
        return;
      }
      setPlanLoading(true);
      setPlanError(null);
      try {
        const rawPlan = await getCompensationPlanForUstaadh(user.id);
        console.log("[UstaadhEarnings] Raw plan from API:", rawPlan);

        // If there's no plan, clear the state
        if (!rawPlan) {
          console.log("[UstaadhEarnings] No plan data found");
          if (active) setCompensationPlan(null);
          return;
        }

        // Ensure we have the required numeric fields with proper types
        const monthlySalary = Number(rawPlan.monthlySalary);
        console.log("[UstaadhEarnings] Parsed monthlySalary:", {
          raw: rawPlan.monthlySalary,
          parsed: monthlySalary,
          isFinite: Number.isFinite(monthlySalary),
        });

        // Normalize plan: ensure numeric fields and currency exist
        const plan: CompensationPlan = {
          ...rawPlan,
          monthlySalary: Number.isFinite(monthlySalary) ? monthlySalary : 0,
          currency: rawPlan.currency || "USD",
          salaryHistory: Array.isArray(rawPlan.salaryHistory)
            ? rawPlan.salaryHistory.map((record: SalaryRecord) => {
                const baseAmount = Number(
                  record.amount ?? rawPlan.monthlySalary ?? 0
                );
                return {
                  ...record,
                  amount: Number.isFinite(baseAmount) ? baseAmount : 0,
                  adjustments: Array.isArray(record.adjustments)
                    ? record.adjustments.map((adj: SalaryAdjustment) => ({
                        ...adj,
                        amount: Number.isFinite(Number(adj.amount))
                          ? Number(adj.amount)
                          : 0,
                      }))
                    : [],
                };
              })
            : [],
        };

        console.log("[UstaadhEarnings] Normalized plan:", {
          monthlySalary: plan?.monthlySalary,
          currency: plan?.currency,
          historyCount: plan?.salaryHistory?.length ?? 0,
          raw: plan,
        });

        if (active) setCompensationPlan(plan as CompensationPlan | null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load compensation plan";
        console.error("Failed to load compensation plan:", err);
        if (active) setPlanError(errorMessage);
      } finally {
        if (active) setPlanLoading(false);
      }
    };
    loadPlan();
    return () => {
      active = false;
    };
  }, [user, getCompensationPlanForUstaadh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Earnings & Analytics
        </h1>
      </div>

      {bookingsLoading || planLoading ? (
        <div className="p-8 bg-white rounded-xl shadow-md flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {planError && (
            <div className="p-3 rounded bg-amber-50 text-amber-700 border border-amber-200 mb-4">
              {planError}
            </div>
          )}
          <EarningsTracker
            bookings={bookings}
            compensationPlan={compensationPlan}
          />
        </>
      )}
    </div>
  );
};
