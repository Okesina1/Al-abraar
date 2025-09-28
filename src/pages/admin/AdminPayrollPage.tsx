import React, { useEffect, useMemo, useState } from 'react';
import { apiClient, API_ENDPOINTS } from '../../utils/api';
import { Check, ClipboardList, DollarSign, Edit3, Plus, Save, Search, Send, X } from 'lucide-react';

interface UstaadhUser {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
}

type SalaryStatus = 'paid' | 'scheduled' | 'processing';

interface SalaryAdjustment {
  id: string;
  type: 'bonus' | 'deduction';
  label: string;
  amount: number;
  note?: string;
  createdAt: string;
}

interface SalaryRecord {
  id: string;
  month: string; // YYYY-MM
  amount: number;
  status: SalaryStatus;
  scheduledPayoutDate: string;
  paidOn?: string;
  adjustments?: SalaryAdjustment[];
}

interface CompensationPlanApi {
  _id?: string;
  ustaadhId: string; // backend sends ObjectId as string
  monthlySalary: number;
  currency: string;
  paymentDayOfMonth: number;
  effectiveFrom: string; // ISO
  nextReviewDate?: string;
  salaryHistory: SalaryRecord[];
}

const formatCurrency = (amount: number, currency = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
const toDisplayDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

const monthKeyNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const MOCK_USTAADHS: UstaadhUser[] = [
  { id: '2', fullName: 'Ahmed Al-Hafiz', email: 'ahmed.hafiz@example.com' },
  { id: '3', fullName: 'Dr. Fatima Al-Zahra', email: 'fatima.zahra@example.com' },
  { id: '4', fullName: 'Ustadh Omar Hassan', email: 'omar.hassan@example.com' },
];

export const AdminPayrollPage: React.FC = () => {
  const [ustaadhs, setUstaadhs] = useState<UstaadhUser[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUstaadhId, setSelectedUstaadhId] = useState<string>('');
  const [plan, setPlan] = useState<CompensationPlanApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredUstaadhs = useMemo(() => {
    const q = search.toLowerCase();
    return ustaadhs.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [ustaadhs, search]);

  useEffect(() => {
    setUstaadhs(MOCK_USTAADHS);
  }, []);

  useEffect(() => {
    if (!selectedUstaadhId) {
      setPlan(null);
      return;
    }
    const loadPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(API_ENDPOINTS.PAYROLL_PLAN_FOR(selectedUstaadhId));
        setPlan(data || null);
      } catch (e: any) {
        setPlan(null);
        setError(null); // No plan yet is acceptable
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, [selectedUstaadhId]);

  const [form, setForm] = useState({ monthlySalary: 1000, currency: 'USD', paymentDayOfMonth: 5, effectiveFrom: new Date().toISOString().slice(0, 10), nextReviewDate: '' });
  useEffect(() => {
    if (plan) {
      setForm({
        monthlySalary: plan.monthlySalary,
        currency: plan.currency,
        paymentDayOfMonth: plan.paymentDayOfMonth,
        effectiveFrom: plan.effectiveFrom.slice(0, 10),
        nextReviewDate: plan.nextReviewDate ? plan.nextReviewDate.slice(0, 10) : '',
      });
    }
  }, [plan]);

  const savePlan = async () => {
    if (!selectedUstaadhId) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        ustaadhId: selectedUstaadhId,
        monthlySalary: Number(form.monthlySalary),
        currency: form.currency,
        paymentDayOfMonth: Number(form.paymentDayOfMonth),
        effectiveFrom: new Date(form.effectiveFrom).toISOString(),
        nextReviewDate: form.nextReviewDate ? new Date(form.nextReviewDate).toISOString() : undefined,
      };
      const saved = await apiClient.post(API_ENDPOINTS.UPSERT_PAYROLL_PLAN, body);
      setPlan(saved);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const [adj, setAdj] = useState({ month: monthKeyNow(), type: 'bonus' as 'bonus' | 'deduction', label: '', amount: 0, note: '' });

  const addAdjustment = async () => {
    if (!selectedUstaadhId) return;
    try {
      const payload = { ...adj, amount: Number(adj.amount) };
      const updated = await apiClient.patch(API_ENDPOINTS.ADD_ADJUSTMENT(selectedUstaadhId), payload);
      setPlan(updated);
      setAdj({ month: monthKeyNow(), type: 'bonus', label: '', amount: 0, note: '' });
    } catch (e: any) {
      setError(e.message || 'Failed to add adjustment');
    }
  };

  const markPaid = async (month: string) => {
    if (!selectedUstaadhId) return;
    try {
      const updated = await apiClient.patch(API_ENDPOINTS.MARK_PAID(selectedUstaadhId), { month, paidOn: new Date().toISOString() });
      setPlan(updated);
    } catch (e: any) {
      setError(e.message || 'Failed to mark as paid');
    }
  };

  const getAdjTotal = (record: SalaryRecord) => (record.adjustments ?? []).reduce((s, a) => (a.type === 'deduction' ? s - a.amount : s + a.amount), 0);
  const getNet = (record: SalaryRecord) => record.amount + getAdjTotal(record);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ustaadhs</h3>
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
          />
          <div className="max-h-[420px] overflow-auto divide-y">
            {filteredUstaadhs.map((u) => {
              const id = u.id || (u as any)._id;
              const active = selectedUstaadhId === id;
              return (
                <button key={id} onClick={() => setSelectedUstaadhId(id)} className={`w-full text-left px-3 py-3 hover:bg-gray-50 ${active ? 'bg-green-50' : ''}`}>
                  <div className="font-medium text-gray-900">{u.fullName}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </button>
              );
            })}
            {filteredUstaadhs.length === 0 && <p className="text-sm text-gray-500">No ustaadhs found</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Compensation Plan</h3>
              <p className="text-xs text-gray-500">Set monthly salary and schedule; add adjustments; mark payouts</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={savePlan} disabled={!selectedUstaadhId || saving} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 text-sm">
                <Save className="h-4 w-4" />
                <span>{plan ? 'Update Plan' : 'Create Plan'}</span>
              </button>
            </div>
          </div>

          {!selectedUstaadhId && <p className="text-sm text-gray-500">Select a ustaadh to manage payroll</p>}

          {selectedUstaadhId && (
            <div className="space-y-6">
              {error && <div className="p-3 text-sm rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Monthly Salary</label>
                  <input type="number" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Currency</label>
                  <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg uppercase" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Payment Day (1-28)</label>
                  <input type="number" min={1} max={28} value={form.paymentDayOfMonth} onChange={(e) => setForm({ ...form, paymentDayOfMonth: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Effective From</label>
                  <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Next Review (optional)</label>
                  <input type="date" value={form.nextReviewDate} onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center space-x-2"><ClipboardList className="h-4 w-4" /><span>Add Adjustment</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Month (YYYY-MM)</label>
                    <input value={adj.month} onChange={(e) => setAdj({ ...adj, month: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type</label>
                    <select value={adj.type} onChange={(e) => setAdj({ ...adj, type: e.target.value as 'bonus' | 'deduction' })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="bonus">Bonus</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Label</label>
                    <input value={adj.label} onChange={(e) => setAdj({ ...adj, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <input type="number" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Note</label>
                    <input value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="md:col-span-6">
                    <button onClick={addAdjustment} disabled={!plan} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 text-sm">
                      <Plus className="h-4 w-4" />
                      <span>Add adjustment</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Salary History</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustments</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid/Scheduled</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(plan?.salaryHistory || []).sort((a, b) => b.month.localeCompare(a.month)).map((record) => {
                        const adjTotal = getAdjTotal(record);
                        const net = getNet(record);
                        return (
                          <tr key={record.id}>
                            <td className="px-4 py-3 text-sm">{record.month}</td>
                            <td className="px-4 py-3 text-sm capitalize">{record.status}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(record.amount, plan?.currency)}</td>
                            <td className={`px-4 py-3 text-sm ${adjTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>{adjTotal === 0 ? '—' : `${adjTotal > 0 ? '+' : '-'}${formatCurrency(Math.abs(adjTotal), plan?.currency)}`}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">{formatCurrency(net, plan?.currency)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{toDisplayDate(record.status === 'paid' ? record.paidOn : record.scheduledPayoutDate)}</td>
                            <td className="px-4 py-3 text-sm">
                              {record.status !== 'paid' ? (
                                <button onClick={() => markPaid(record.month)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs flex items-center space-x-1">
                                  <Send className="h-3 w-3" />
                                  <span>Mark paid</span>
                                </button>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs inline-flex items-center"><Check className="h-3 w-3 mr-1" />Paid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {(!plan || plan.salaryHistory.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">No salary records yet. Create a plan to schedule payouts.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayrollPage;
