import React, { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Users,
} from "lucide-react";
import { Booking, CompensationPlan, SalaryRecord } from "../../types";
import { useToast } from "../../contexts/ToastContext";

interface EarningsTrackerProps {
  bookings: Booking[];
  compensationPlan: CompensationPlan | null;
}

const localeForCurrency = (currency?: string) => {
  if (!currency) return undefined;
  switch (currency.toUpperCase()) {
    case "NGN":
      // use en-NG for Nigerian formatting (Intl may fallback if not available)
      return "en-NG";
    case "USD":
    default:
      return "en-US";
  }
};

const formatCurrency = (
  amount: number | null | undefined,
  currency?: string
) => {
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(Number(amount))
  ) {
    return "Not configured";
  }
  const locale = localeForCurrency(currency);
  return new Intl.NumberFormat(locale || undefined, {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount));
};

const formatMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map((value) => parseInt(value, 10));
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
};

const toScheduledDateISO = (monthKey: string, paymentDay: number) => {
  // monthKey expected format: YYYY-MM
  if (!monthKey || typeof monthKey !== "string") return undefined;
  const parts = monthKey.split("-");
  if (parts.length !== 2) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  )
    return undefined;

  const daysInTargetMonth = new Date(year, month, 0).getDate();
  const safePaymentDay =
    Number.isFinite(paymentDay) && paymentDay > 0
      ? Math.min(paymentDay, daysInTargetMonth)
      : daysInTargetMonth;
  const date = new Date(Date.UTC(year, month - 1, safePaymentDay));
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const toDisplayDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const getAdjustmentTotal = (record: SalaryRecord) =>
  (record.adjustments ?? []).reduce((sum, adjustment) => {
    return adjustment.type === "deduction"
      ? sum - adjustment.amount
      : sum + adjustment.amount;
  }, 0);

const getNetAmount = (record: SalaryRecord) =>
  record.amount + getAdjustmentTotal(record);

const buildRevenueSeries = (monthsCount: number, bookings: Booking[]) => {
  const now = new Date();
  const revenueMap = new Map<string, number>();

  bookings.forEach((booking) => {
    const createdAt = new Date(booking.createdAt);
    const key = formatMonthKey(createdAt);
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + booking.totalAmount);
  });

  return Array.from({ length: monthsCount }, (_, index) => {
    const monthDate = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() - (monthsCount - 1 - index), 1)
    );
    const key = formatMonthKey(monthDate);
    const label = monthDate.toLocaleDateString(undefined, { month: "short" });
    return {
      month: label,
      revenue: revenueMap.get(key) ?? 0,
    };
  });
};

export const EarningsTracker: React.FC<EarningsTrackerProps> = ({
  bookings,
  compensationPlan,
}) => {
  const toast = useToast();
  const [selectedRange, setSelectedRange] = useState<"6m" | "12m">("6m");

  const paidBookings = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === "paid"),
    [bookings]
  );

  const revenueStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));

    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    paidBookings.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt);
      const amount = booking.totalAmount;
      totalRevenue += amount;

      if (
        bookingDate.getFullYear() === currentYear &&
        bookingDate.getMonth() === currentMonth
      ) {
        thisMonthRevenue += amount;
      }

      if (
        bookingDate.getFullYear() === lastMonthDate.getFullYear() &&
        bookingDate.getMonth() === lastMonthDate.getMonth()
      ) {
        lastMonthRevenue += amount;
      }
    });

    const growth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    return {
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      growth,
    };
  }, [paidBookings]);

  const chartData = useMemo(
    () => buildRevenueSeries(selectedRange === "12m" ? 12 : 6, paidBookings),
    [selectedRange, paidBookings]
  );

  const salaryStats = useMemo(() => {
    if (!compensationPlan) {
      return null;
    }

    const now = new Date();
    const currentMonthKey = formatMonthKey(now);
    const history = [...(compensationPlan.salaryHistory ?? [])].sort((a, b) =>
      a.month.localeCompare(b.month)
    );
    const historyMap = new Map(history.map((record) => [record.month, record]));

    // ensure monthlySalary is a number; if not set, keep null so UI can show "Not configured"
    const monthlySalaryNum = Number(compensationPlan.monthlySalary);
    const safeMonthlySalary: number | null = Number.isFinite(monthlySalaryNum)
      ? monthlySalaryNum
      : null;

    const fallbackScheduledDate = (monthKey: string) => {
      const parts = monthKey.split("-");
      if (parts.length !== 2) return new Date().toISOString();
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const days = new Date(y, m, 0).getDate();
      return new Date(Date.UTC(y, m - 1, days)).toISOString();
    };

    const ensureRecord = (monthKey: string): SalaryRecord =>
      historyMap.get(monthKey) ?? {
        id: `${compensationPlan.ustaadhId}-${monthKey}`,
        month: monthKey,
        // records should carry a numeric amount for arithmetic; if monthlySalary is not configured, use 0 for calculations
        amount: safeMonthlySalary ?? 0,
        status: "scheduled",
        scheduledPayoutDate:
          toScheduledDateISO(monthKey, compensationPlan.paymentDayOfMonth) ??
          fallbackScheduledDate(monthKey),
        adjustments: [],
      };

    const currentRecord = ensureRecord(currentMonthKey);
    const isCurrentTracked = historyMap.has(currentMonthKey);
    const normalisedHistory = isCurrentTracked
      ? history
      : [...history, currentRecord];
    normalisedHistory.sort((a, b) => b.month.localeCompare(a.month));

    const ytdPaid = normalisedHistory.reduce((sum, record) => {
      const yearMatches = record.month.startsWith(`${now.getFullYear()}-`);
      return record.status === "paid" && yearMatches
        ? sum + getNetAmount(record)
        : sum;
    }, 0);

    const pendingAmount = normalisedHistory.reduce((sum, record) => {
      return record.status !== "paid" ? sum + getNetAmount(record) : sum;
    }, 0);

    const paidHistory = normalisedHistory.filter(
      (record) => record.status === "paid"
    );
    const lastPaidRecord = paidHistory.length > 0 ? paidHistory[0] : null;

    const upcomingRecord = (() => {
      const futureRecords = [...normalisedHistory]
        .filter((record) => record.status !== "paid")
        .sort((a, b) =>
          a.scheduledPayoutDate.localeCompare(b.scheduledPayoutDate)
        );
      if (futureRecords.length > 0) {
        return futureRecords[0];
      }
      const nextMonthKey = formatMonthKey(
        new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1))
      );
      return ensureRecord(nextMonthKey);
    })();

    return {
      currency: compensationPlan.currency,
      monthlySalary: safeMonthlySalary,
      currentRecord,
      ytdPaid,
      pendingAmount,
      lastPaidRecord,
      upcomingRecord,
      history: normalisedHistory,
      paymentDay: compensationPlan.paymentDayOfMonth,
      nextReviewDate: compensationPlan.nextReviewDate,
      effectiveFrom: compensationPlan.effectiveFrom,
    };
  }, [compensationPlan]);

  const totalStudents = useMemo(
    () => new Set(bookings.map((booking) => booking.studentId)).size,
    [bookings]
  );
  const activeSubscriptions = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").length,
    [bookings]
  );

  const downloadPayrollStatement = () => {
    toast.info("Preparing payroll statement for download...");
    if (!compensationPlan) {
      toast.error("No compensation plan available to build payroll statement.");
      return;
    }

    try {
      const rows: string[][] = [];
      // Header
      rows.push([
        "Month",
        "Status",
        "Base Salary",
        "Adjustments",
        "Net Amount",
        "Paid / Scheduled Date",
      ]);

      const historyRows = (salaryStats?.history ?? []).map((r) => {
        const adjustmentsTotal = Number(getAdjustmentTotal(r) ?? 0);
        // ensure amount is a finite number
        const amount = Number.isFinite(Number(r?.amount))
          ? Number(r.amount)
          : 0;
        let net = Number(getNetAmount(r) ?? amount + adjustmentsTotal);
        if (!Number.isFinite(net)) net = amount + adjustmentsTotal;
        const date =
          r?.status === "paid" ? r?.paidOn || "" : r?.scheduledPayoutDate || "";
        return [
          r?.month || "",
          r?.status || "",
          String(amount),
          String(adjustmentsTotal),
          String(net),
          String(date),
        ];
      });

      rows.push(...historyRows);

      const csvContent = rows
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `payroll-statement-${compensationPlan.ustaadhId}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Payroll statement downloaded");
    } catch (err) {
      console.error("Failed to generate payroll CSV", err);
      toast.error("Failed to prepare payroll statement");
    }
  };

  if (!compensationPlan || !salaryStats) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-amber-200">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">
            Salary plan pending configuration
          </h2>
          <p className="text-sm text-amber-700">
            Your administrator has not yet assigned a monthly salary plan.
            Please reach out to the admin team to have a compensation package
            configured. The revenue overview below remains available for
            reference only.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Revenue Overview
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Once a salary plan is established, your payroll summary will appear
            here with administrator-approved disbursements.
          </p>
        </div>
      </div>
    );
  }

  const {
    currency,
    monthlySalary,
    currentRecord,
    ytdPaid,
    pendingAmount,
    lastPaidRecord,
    upcomingRecord,
    history,
  } = salaryStats;

  const currentAdjustmentsTotal = getAdjustmentTotal(currentRecord);
  const currentNetSalary = getNetAmount(currentRecord);
  const statusLabels: Record<SalaryRecord["status"], string> = {
    paid: "Paid",
    processing: "Processing",
    scheduled: "Scheduled",
  };

  const chartCurrencyFormatter = (value: number) =>
    formatCurrency(value, currency);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Base Monthly Salary</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlySalary, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Set by system administration
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Current Cycle Net Pay
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(currentNetSalary, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Status: {statusLabels[currentRecord.status]} • Scheduled{" "}
                {toDisplayDate(currentRecord.scheduledPayoutDate)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Year-to-Date Payroll</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(ytdPaid, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last paid {toDisplayDate(lastPaidRecord?.paidOn)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-amber-600">
                {totalStudents}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activeSubscriptions} active subscriptions
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Revenue Overview
            </h3>
            <p className="text-sm text-gray-500">
              Platform bookings revenue for reference (not directly disbursed)
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedRange}
              onChange={(event) =>
                setSelectedRange(event.target.value as "6m" | "12m")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
            </select>
            <button
              onClick={downloadPayrollStatement}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download payroll statement</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {chartData.map((dataPoint, index) => (
            <div
              key={`${dataPoint.month}-${index}`}
              className="flex items-center space-x-4"
            >
              <div className="w-12 text-sm text-gray-600">
                {dataPoint.month}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.min(100, dataPoint.revenue === 0 ? 4 : (dataPoint.revenue / Math.max(...chartData.map((entry) => entry.revenue || 1), 1)) * 100)}%`,
                  }}
                >
                  <span className="text-white text-xs font-medium">
                    {chartCurrencyFormatter(dataPoint.revenue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compensation & Revenue Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Compensation Breakdown
          </h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Base salary
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(currentRecord.amount, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Adjustments</span>
                <span
                  className={`font-medium ${currentAdjustmentsTotal >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {currentAdjustmentsTotal === 0
                    ? "—"
                    : `${currentAdjustmentsTotal >= 0 ? "+" : ""}${formatCurrency(Math.abs(currentAdjustmentsTotal), currency)}`}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Net payout
                </span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(currentNetSalary, currency)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm text-gray-600">
              <p>
                • Effective since {toDisplayDate(salaryStats.effectiveFrom)}
              </p>
              <p>
                • Payment scheduled every month on day {salaryStats.paymentDay}
              </p>
              <p>
                • Next review date{" "}
                {salaryStats.nextReviewDate
                  ? toDisplayDate(salaryStats.nextReviewDate)
                  : "to be determined"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Platform Revenue Snapshot
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span>Gross revenue collected</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(revenueStats.totalRevenue, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Revenue this month</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(revenueStats.thisMonthRevenue, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending payroll obligations</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(pendingAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Month-over-month revenue change</span>
              <span
                className={`font-semibold ${revenueStats.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {revenueStats.growth >= 0 ? "+" : ""}
                {revenueStats.growth.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 pt-2">
              Revenue figures are provided for awareness. Salaries are issued
              independently by the admin team according to approved payroll
              schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Schedule
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-800">Next payout</span>
                <span className="text-gray-600">
                  {toDisplayDate(upcomingRecord.scheduledPayoutDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(getNetAmount(upcomingRecord), currency)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-gray-900">
                  {statusLabels[upcomingRecord.status]}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                Payroll guidelines
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  • Salaries are released by the admin team on the scheduled
                  date once attendance is confirmed.
                </li>
                <li>
                  • Adjustments (bonuses or deductions) are reviewed and
                  approved before disbursement.
                </li>
                <li>
                  • Reach out to finance@al-abraar.com for payroll inquiries or
                  updates.
                </li>
              </ul>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-gray-800">
                  Most recent payout
                </span>
                <span className="text-gray-600">
                  {toDisplayDate(lastPaidRecord?.paidOn)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {lastPaidRecord
                    ? formatCurrency(getNetAmount(lastPaidRecord), currency)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Adjustment log (current cycle)
          </h3>
          {currentRecord.adjustments && currentRecord.adjustments.length > 0 ? (
            <ul className="space-y-3 text-sm text-gray-700">
              {currentRecord.adjustments.map((adjustment) => (
                <li
                  key={adjustment.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {adjustment.label}
                    </span>
                    <span
                      className={`font-semibold ${adjustment.type === "bonus" ? "text-green-600" : "text-red-600"}`}
                    >
                      {adjustment.type === "bonus" ? "+" : "-"}
                      {formatCurrency(adjustment.amount, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recorded {toDisplayDate(adjustment.createdAt)}
                  </p>
                  {adjustment.note && (
                    <p className="text-xs text-gray-600 mt-2">
                      {adjustment.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500">
              No bonuses or deductions have been recorded for this cycle.
            </div>
          )}
        </div>
      </div>

      {/* Salary History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Salary history
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base salary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adjustments
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid / scheduled
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((record) => {
                const adjustmentTotal = getAdjustmentTotal(record);
                return (
                  <tr key={record.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMonthLabel(record.month)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {statusLabels[record.status]}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.amount, currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {adjustmentTotal === 0
                        ? "—"
                        : `${adjustmentTotal > 0 ? "+" : "-"}${formatCurrency(Math.abs(adjustmentTotal), currency)}`}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                      {formatCurrency(getNetAmount(record), currency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {toDisplayDate(
                        record.status === "paid"
                          ? record.paidOn
                          : record.scheduledPayoutDate
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
