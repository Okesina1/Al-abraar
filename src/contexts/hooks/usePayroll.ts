import { useContext } from "react";
import { PayrollContext } from "../PayrollContext";

export const usePayroll = () => {
  const context = useContext(PayrollContext);
  if (!context) {
    throw new Error("usePayroll must be used within a PayrollProvider");
  }
  return context;
};
