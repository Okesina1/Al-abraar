import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { CompensationPlan } from "../types";
import { payrollApi } from "../utils/api";

interface PayrollContextType {
  plans: CompensationPlan[];
  loading: boolean;
  getCompensationPlanForUstaadh: (
    ustaadhId: string
  ) => Promise<CompensationPlan | null>;
  upsertCompensationPlan: (data: any) => Promise<void>;
  recordSalaryPayment: (
    ustaadhId: string,
    month: string,
    amount: number
  ) => Promise<void>;
  addSalaryAdjustment: (
    ustaadhId: string,
    adjustmentData: any
  ) => Promise<void>;
  getPayrollObligations: (month?: string) => Promise<any>;
  refreshPlans: () => Promise<void>;
}

const PayrollContext = createContext<PayrollContextType | null>(null);

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
      const response = await payrollApi.getPayrollObligations();
      setPlans(response.plans || response);
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
        return response.plan || response;
      } catch (error) {
        console.error("Failed to fetch compensation plan:", error);
        return null;
      }
    },
    []
  );

  const upsertCompensationPlan = useCallback(
    async (data: any) => {
      try {
        await payrollApi.upsertCompensationPlan(data);
        await refreshPlans();
      } catch (error: any) {
        throw new Error(error.message || "Failed to upsert compensation plan");
      }
    },
    [refreshPlans]
  );

  const recordSalaryPayment = useCallback(
    async (ustaadhId: string, month: string, amount: number) => {
      try {
        await payrollApi.markPaid(ustaadhId, { month, amount });
        await refreshPlans();
      } catch (error: any) {
        throw new Error(error.message || "Failed to record salary payment");
      }
    },
    [refreshPlans]
  );

  const addSalaryAdjustment = useCallback(
    async (ustaadhId: string, adjustmentData: any) => {
      try {
        await payrollApi.addAdjustment(ustaadhId, adjustmentData);
        await refreshPlans();
      } catch (error: any) {
        throw new Error(error.message || "Failed to add salary adjustment");
      }
    },
    [refreshPlans]
  );

  const getPayrollObligations = useCallback(async (month?: string) => {
    try {
      const response = await payrollApi.getPayrollObligations(month);
      return response;
    } catch (error: any) {
      console.error("Failed to fetch payroll obligations:", error);
      throw error;
    }
  }, []);

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

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return context;
};
