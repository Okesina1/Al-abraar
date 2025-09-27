import React, { useState } from 'react';
import { Settings, DollarSign, Shield, BookOpen, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const [pricing, setPricing] = useState({ basic: 5, complete: 7 });
  const [refundPolicy, setRefundPolicy] = useState({ enabled: true, windowDays: 7 });
  const [courseAvailability, setCourseAvailability] = useState({ quran: true, tajweed: true, hadeeth: true, arabic: true });

  const toast = useToast();
  const handleSave = () => {
    toast.success('Settings saved (mock). Changes will apply platform-wide.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="h-6 w-6 text-green-600" />
          <span>Platform Settings</span>
        </h1>
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save</span>
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
    </div>
  );
}
