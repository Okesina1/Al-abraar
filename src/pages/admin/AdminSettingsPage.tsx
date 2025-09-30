import React, { useEffect, useState } from 'react';
import { Settings, DollarSign, Shield, BookOpen, Save, BarChart3 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { settingsApi } from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminSettingsPage: React.FC = () => {
  const [pricing, setPricing] = useState({ basic: 5, complete: 7 });
  const [refundPolicy, setRefundPolicy] = useState({ enabled: true, windowDays: 7 });
  const [courseAvailability, setCourseAvailability] = useState({ quran: true, tajweed: true, hadeeth: true, arabic: true });
  const [publicStats, setPublicStats] = useState<{ activeStudents?: number; countries?: number; avgRating?: number }>({ activeStudents: 10000, countries: 40, avgRating: 4.9 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const s = await settingsApi.getSettings();
        if (!isMounted) return;
        if (s?.pricing) setPricing(s.pricing);
        if (s?.refundPolicy) setRefundPolicy(s.refundPolicy);
        if (s?.courseAvailability) setCourseAvailability(s.courseAvailability);
        if (s?.publicStats) setPublicStats(s.publicStats);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load settings');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        settingsApi.updatePricing(pricing),
        settingsApi.updateRefundPolicy(refundPolicy),
        settingsApi.updateCourseAvailability(courseAvailability as any),
        settingsApi.updatePublicStats(publicStats),
      ]);
      toast.success('Settings saved successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="h-6 w-6 text-green-600" />
          <span>Platform Settings</span>
        </h1>
        <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-60">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Pricing</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qur'an & Tajweed ($/hr)</label>
            <input type="number" value={pricing.basic} min={1} onChange={(e)=>setPricing({...pricing, basic: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complete Package ($/hr)</label>
            <input type="number" value={pricing.complete} min={1} onChange={(e)=>setPricing({...pricing, complete: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Refund Policy</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <span className="text-gray-800">Enable Refunds</span>
            <input type="checkbox" checked={refundPolicy.enabled} onChange={(e)=>setRefundPolicy({...refundPolicy, enabled: e.target.checked})} />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Refund Window (days)</label>
            <input type="number" min={0} value={refundPolicy.windowDays} onChange={(e)=>setRefundPolicy({...refundPolicy, windowDays: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>

      {/* Course Availability */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Course Availability</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(courseAvailability).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg capitalize">
              <span className="text-gray-800">{key}</span>
              <input type="checkbox" checked={val} onChange={(e)=>setCourseAvailability({...courseAvailability, [key]: e.target.checked} as any)} />
            </label>
          ))}
        </div>
      </div>

      {/* Public Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Public Stats (Landing)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Students</label>
            <input type="number" min={0} value={publicStats.activeStudents ?? 0} onChange={(e)=>setPublicStats({ ...publicStats, activeStudents: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
            <input type="number" min={0} value={publicStats.countries ?? 0} onChange={(e)=>setPublicStats({ ...publicStats, countries: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Average Rating</label>
            <input type="number" step="0.1" min={0} max={5} value={publicStats.avgRating ?? 0} onChange={(e)=>setPublicStats({ ...publicStats, avgRating: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
