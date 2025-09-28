import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { CompensationPlan, SalaryAdjustment, SalaryRecord } from '../types';

interface PayrollContextType {
  plans: CompensationPlan[];
  getCompensationPlanForUstaadh: (ustaadhId: string) => CompensationPlan | null;
  recordSalaryPayment: (ustaadhId: string, salaryRecord: SalaryRecord) => void;
  addSalaryAdjustment: (ustaadhId: string, month: string, adjustment: SalaryAdjustment) => void;
  updateMonthlySalary: (ustaadhId: string, amount: number) => void;
}

const PayrollContext = createContext<PayrollContextType | null>(null);

const formatMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const toScheduledDateISO = (monthKey: string, paymentDay: number) => {
  const [year, month] = monthKey.split('-').map((part) => parseInt(part, 10));
  const daysInTargetMonth = new Date(year, month, 0).getDate();
  const day = Math.min(paymentDay, daysInTargetMonth);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString();
};

const buildInitialPlans = (): CompensationPlan[] => {
  const today = new Date();
  const baseSalary = 950;
  const paymentDay = 5;

  const offsets = [-3, -2, -1, 0, 1];
  const salaryHistory: SalaryRecord[] = offsets.map((offset) => {
    const reference = new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1));
    const monthKey = formatMonthKey(reference);
    const scheduledDate = toScheduledDateISO(monthKey, paymentDay);

    const status: SalaryRecord['status'] = offset < 0 ? 'paid' : offset === 0 ? 'processing' : 'scheduled';
    const paidOn = offset < 0 ? scheduledDate : undefined;

    const adjustments: SalaryAdjustment[] | undefined = (() => {
      if (offset === -2) {
        return [
          {
            id: `${monthKey}-bonus-1`,
            type: 'bonus',
            label: 'Student satisfaction bonus',
            amount: 120,
            note: 'Awarded for consistently high ratings',
            createdAt: new Date(Date.UTC(reference.getFullYear(), reference.getMonth(), 27)).toISOString(),
          },
        ];
      }

      if (offset === -1) {
        return [
          {
            id: `${monthKey}-deduction-1`,
            type: 'deduction',
            label: 'Equipment stipend reimbursement',
            amount: 45,
            note: 'Recovered cost of school-provided tablet',
            createdAt: new Date(Date.UTC(reference.getFullYear(), reference.getMonth(), 12)).toISOString(),
          },
        ];
      }

      if (offset === 0) {
        return [
          {
            id: `${monthKey}-bonus-1`,
            type: 'bonus',
            label: 'Community workshop facilitation',
            amount: 80,
            note: 'Weekend Qur’an workshop delivered for two cohorts',
            createdAt: new Date().toISOString(),
          },
        ];
      }

      return undefined;
    })();

    return {
      id: monthKey,
      month: monthKey,
      amount: baseSalary,
      status,
      scheduledPayoutDate: scheduledDate,
      paidOn,
      adjustments,
    };
  });

  return [
    {
      ustaadhId: '2',
      monthlySalary: baseSalary,
      currency: 'USD',
      paymentDayOfMonth: paymentDay,
      effectiveFrom: formatMonthKey(new Date(Date.UTC(today.getFullYear(), today.getMonth() - 6, 1))) + '-01',
      nextReviewDate: new Date(Date.UTC(today.getFullYear(), today.getMonth() + 9, 1)).toISOString(),
      salaryHistory,
    },
  ];
};

export const PayrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<CompensationPlan[]>(() => buildInitialPlans());

  const getCompensationPlanForUstaadh = useCallback(
    (ustaadhId: string) => plans.find((plan) => plan.ustaadhId === ustaadhId) ?? null,
    [plans]
  );

  const recordSalaryPayment = useCallback(
    (ustaadhId: string, salaryRecord: SalaryRecord) => {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.ustaadhId !== ustaadhId) {
            return plan;
          }
          const filteredHistory = plan.salaryHistory.filter((record) => record.month !== salaryRecord.month);
          return { ...plan, salaryHistory: [...filteredHistory, salaryRecord] };
        })
      );
    },
    []
  );

  const addSalaryAdjustment = useCallback(
    (ustaadhId: string, month: string, adjustment: SalaryAdjustment) => {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.ustaadhId !== ustaadhId) {
            return plan;
          }

          const updatedHistory = plan.salaryHistory.some((record) => record.month === month)
            ? plan.salaryHistory.map((record) =>
                record.month === month
                  ? {
                      ...record,
                      adjustments: [...(record.adjustments ?? []), adjustment],
                    }
                  : record
              )
            : [
                ...plan.salaryHistory,
                {
                  id: month,
                  month,
                  amount: plan.monthlySalary,
                  status: 'scheduled',
                  scheduledPayoutDate: toScheduledDateISO(month, plan.paymentDayOfMonth),
                  adjustments: [adjustment],
                },
              ];

          return { ...plan, salaryHistory: updatedHistory };
        })
      );
    },
    []
  );

  const updateMonthlySalary = useCallback((ustaadhId: string, amount: number) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.ustaadhId === ustaadhId ? { ...plan, monthlySalary: amount } : plan))
    );
  }, []);

  return (
    <PayrollContext.Provider
      value={{ plans, getCompensationPlanForUstaadh, recordSalaryPayment, addSalaryAdjustment, updateMonthlySalary }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider');
  }
  return context;
};
