import React, {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { CompensationPlan, SalaryAdjustment } from "../types";
import { payrollApi } from "../utils/api";

interface CompensationPlanInput {
  ustaadhId: string;
  monthlySalary: number;
  currency: string;
  paymentDayOfMonth: number;
  effectiveFrom: string;
  nextReviewDate?: string;
}

interface AdjustmentInput {
  type: "bonus" | "deduction";
  label: string;
  amount: number;
  note?: string;
}

interface PayrollObligation {
  ustaadhId: string;
  amount: number;
  currency: string;
  status: "paid" | "scheduled" | "processing";
  scheduledPayoutDate: string;
  adjustments: SalaryAdjustment[];
}

export interface PayrollContextType {
  plans: CompensationPlan[];
  loading: boolean;
  getCompensationPlanForUstaadh: (
    ustaadhId: string
  ) => Promise<CompensationPlan | null>;
  upsertCompensationPlan: (data: CompensationPlanInput) => Promise<void>;
  recordSalaryPayment: (ustaadhId: string, month: string) => Promise<void>;
  addSalaryAdjustment: (
    ustaadhId: string,
    adjustmentData: AdjustmentInput
  ) => Promise<void>;
  getPayrollObligations: (month?: string) => Promise<PayrollObligation[]>;
  refreshPlans: () => Promise<void>;
}

export const PayrollContext = createContext<PayrollContextType | null>(null);

export const PayrollProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [plans, setPlans] = useState<CompensationPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshPlans = useCallback(async () => {
    const token = localStorage.getItem("al-abraar-token");
    if (!token || !user || user.role !== "admin") return;
    try {
      setLoading(true);
      // Fetch the raw plans list
      const plansResp = await payrollApi.getAllPlans();
      // Ensure plans is an array
      const fetchedPlans = Array.isArray(plansResp)
        ? plansResp
        : plansResp.plans || [];
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to fetch payroll plans:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshPlans();
    }
  }, [user, refreshPlans]);

  const getCompensationPlanForUstaadh = useCallback(
    async (ustaadhId: string): Promise<CompensationPlan | null> => {
      try {
        const response = await payrollApi.getCompensationPlan(ustaadhId);
        console.log("[PayrollContext] Raw API response:", response);
        // If response.plan is null, the user has no plan
        if (response.plan === null) {
          return null;
        }

        // Handle both { plan: {...} } and direct plan object responses
        const planData = response.plan || response;
        if (!planData) return null;

        // Only normalize if we have valid plan data
        if (typeof planData === "object" && planData !== null) {
          return {
            ...planData,
            monthlySalary: Number.isFinite(Number(planData.monthlySalary))
              ? Number(planData.monthlySalary)
              : 0,
            currency: planData.currency || "USD",
            salaryHistory: Array.isArray(planData.salaryHistory)
              ? planData.salaryHistory
              : [],
          };
        }

        return null;
      } catch (error) {
        console.error("Failed to fetch compensation plan:", error);
        return null;
      }
    },
    []
  );

  const upsertCompensationPlan = useCallback(
    async (data: CompensationPlanInput) => {
      try {
        await payrollApi.upsertCompensationPlan(data);
        await refreshPlans();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to upsert compensation plan";
        throw new Error(message);
      }
    },
    [refreshPlans]
  );

  const recordSalaryPayment = useCallback(
    async (ustaadhId: string, month: string) => {
      try {
        // Server MarkPaidDto only accepts { month: string, paidOn?: string }
        // Do not send `amount` in the payload to avoid validation errors.
        await payrollApi.markPaid(ustaadhId, { month });
        await refreshPlans();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to record salary payment";
        throw new Error(message);
      }
    },
    [refreshPlans]
  );

  const addSalaryAdjustment = useCallback(
    async (ustaadhId: string, adjustmentData: AdjustmentInput) => {
      try {
        await payrollApi.addAdjustment(ustaadhId, adjustmentData);
        await refreshPlans();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to add salary adjustment";
        throw new Error(message);
      }
    },
    [refreshPlans]
  );

  const getPayrollObligations = useCallback(
    async (month?: string): Promise<PayrollObligation[]> => {
      try {
        const response = await payrollApi.getPayrollObligations(month);
        return response;
      } catch (error) {
        console.error("Failed to fetch payroll obligations:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch payroll obligations");
      }
    },
    []
  );

  return (
    <PayrollContext.Provider
      value={{
        plans,
        loading,
        getCompensationPlanForUstaadh,
        upsertCompensationPlan,
        recordSalaryPayment,
        addSalaryAdjustment,
        getPayrollObligations,
        refreshPlans,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};
