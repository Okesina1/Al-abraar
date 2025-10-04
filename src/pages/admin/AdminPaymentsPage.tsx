import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { usePayroll } from "../../contexts/hooks/usePayroll";
import { paymentsApi } from "../../utils/api";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { SalaryAdjustment, SalaryRecord } from "../../types";

interface Payment {
  id: string;
  bookingId: string;
  studentName: string;
  ustaadhName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  platformFee: number;
  ustaadhEarning: number;
}

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    amount
  );

export const AdminPaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const { plans } = usePayroll();

  useEffect(() => {
    let isMounted = true;

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await paymentsApi.getPaymentHistory({ limit: "100" });

        if (!isMounted) return;

        const paymentsData = Array.isArray(response?.payments)
          ? response.payments
          : Array.isArray(response)
            ? response
            : [];

        interface RawPayment {
          id?: string;
          _id?: string;
          paymentIntentId?: string;
          studentId?: { fullName: string } | string;
          ustaadhId?: { fullName: string } | string;
          bookingId?: { id?: string; _id?: string } | string;
          studentName?: string;
          ustaadhName?: string;
          amount: number;
          currency?: string;
          status: string;
          paymentMethod?: string;
          transactionId?: string;
          createdAt: string;
        }

        const normalizedPayments = paymentsData.map((p: RawPayment) => {
          const studentName =
            typeof p.studentId === "object" && p.studentId !== null
              ? p.studentId.fullName
              : p.studentName || "Student";

          const ustaadhName =
            typeof p.ustaadhId === "object" && p.ustaadhId !== null
              ? p.ustaadhId.fullName
              : p.ustaadhName || "Ustaadh";

          const bookingId =
            typeof p.bookingId === "object" && p.bookingId !== null
              ? p.bookingId.id || p.bookingId._id
              : p.bookingId || "";

          const platformFeeRate = 0.3;
          const platformFee =
            p.status === "succeeded" || p.status === "completed"
              ? p.amount * platformFeeRate
              : 0;

          return {
            id: p.id || p._id || p.paymentIntentId || "",
            bookingId,
            studentName,
            ustaadhName,
            amount: p.amount,
            currency: p.currency || "USD",
            status: p.status === "succeeded" ? "completed" : p.status,
            paymentMethod: p.paymentMethod || "Credit Card",
            transactionId: p.paymentIntentId || p.transactionId || p.id || "",
            createdAt: p.createdAt,
            platformFee,
            ustaadhEarning: p.amount - platformFee,
          };
        });

        setPayments(normalizedPayments);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ustaadhName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || payment.status === statusFilter;
    const matchesDate = !dateFilter || payment.createdAt.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const platformShare = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.platformFee, 0);
  const pendingPayments = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = payments.filter((p) => p.status === "failed").length;

  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const payrollSummary = useMemo(() => {
    const getAdj = (r: SalaryRecord) =>
      (r.adjustments ?? []).reduce(
        (s: number, a: SalaryAdjustment) =>
          a.type === "deduction" ? s - a.amount : s + a.amount,
        0
      );
    const getNet = (r: SalaryRecord) => r.amount + getAdj(r);

    let scheduled = 0;
    let paid = 0;

    plans.forEach((plan) => {
      const record = plan.salaryHistory.find(
        (r) => r.month === currentMonthKey
      ) || {
        id: `${plan.ustaadhId}-${currentMonthKey}`,
        month: currentMonthKey,
        amount: plan.monthlySalary,
        status: "scheduled",
        scheduledPayoutDate: new Date(
          Number(currentMonthKey.split("-")[0]),
          Number(currentMonthKey.split("-")[1]) - 1,
          plan.paymentDayOfMonth || 1
        ).toISOString(),
        adjustments: [],
      };
      if (record.status === "paid") paid += getNet(record);
      else scheduled += getNet(record);
    });

    const ytd = plans.reduce(
      (sum, plan) =>
        sum +
        plan.salaryHistory
          .filter(
            (r) =>
              r.status === "paid" &&
              r.month.startsWith(`${new Date().getFullYear()}-`)
          )
          .reduce((s, r) => s + getNet(r), 0),
      0
    );

    return { scheduled, paid, ytd, currency: plans[0]?.currency || "USD" };
  }, [plans, currentMonthKey]);

  const stats = [
    {
      title: "Total Revenue (bookings)",
      value: formatCurrency(totalRevenue),
      color: "bg-green-500",
      icon: DollarSign,
    },
    {
      title: "Platform Share",
      value: formatCurrency(platformShare),
      color: "bg-blue-500",
      icon: TrendingUp,
    },
    {
      title: "Pending Student Payments",
      value: formatCurrency(pendingPayments),
      color: "bg-yellow-500",
      icon: Calendar,
    },
    {
      title: "Failed Student Payments",
      value: failedPayments.toString(),
      color: "bg-red-500",
      icon: RefreshCw,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Payroll</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredPayments.length} payment
              {filteredPayments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ustaadh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform Fee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{payment.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.transactionId}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.studentName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Booking #{payment.bookingId}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.ustaadhName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Payroll-based salary model
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.currency}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ${payment.platformFee}
                    </div>
                    <div className="text-sm text-gray-500">Platform share</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No payments found</p>
          </div>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revenue Breakdown (bookings)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-800">Total Revenue</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-800">Platform Share</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(platformShare)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-gray-800">
                Planned Salaries (YTD)
              </span>
              <span className="font-semibold text-purple-600">
                {formatCurrency(payrollSummary.ytd, payrollSummary.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payroll Summary
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span>Current month scheduled</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(
                  payrollSummary.scheduled,
                  payrollSummary.currency
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Current month paid</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(payrollSummary.paid, payrollSummary.currency)}
              </span>
            </div>
            <div className="flex items-center space-x-2 pt-2 text-xs text-gray-500">
              <ClipboardList className="h-4 w-4" />
              <span>
                Admin controls salary payouts monthly. Student payments do not
                auto-disburse to ustaadhs.
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">Credit Card</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">
                  {
                    payments.filter((p) => p.paymentMethod === "Credit Card")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">transactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
