import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Star } from 'lucide-react';
import { testimonialsApi } from '../../utils/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

interface Testimonial {
  id: string;
  name: string;
  subtitle?: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  isPublished: boolean;
  order: number;
}

export const AdminTestimonialsPage: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await testimonialsApi.listAll();
      const list: Testimonial[] = (Array.isArray(res) ? res : res?.data || []).map((t: any) => ({
        id: t.id || t._id,
        name: t.name,
        subtitle: t.subtitle,
        quote: t.quote,
        rating: typeof t.rating === 'number' ? t.rating : 5,
        avatarUrl: t.avatarUrl,
        isPublished: !!t.isPublished,
        order: typeof t.order === 'number' ? t.order : 0,
      }));
      setItems(list);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedItems = useMemo(() => items.slice().sort((a, b) => a.order - b.order), [items]);

  const startCreate = () => {
    setEditing({ id: '', name: '', quote: '', rating: 5, isPublished: true, order: items.length, subtitle: '', avatarUrl: '' });
  };

  const startEdit = (item: Testimonial) => setEditing(item);

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.name || !editing.quote) {
      toast.error('Name and quote are required');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await testimonialsApi.update(editing.id, {
          name: editing.name,
          subtitle: editing.subtitle,
          quote: editing.quote,
          rating: editing.rating,
          avatarUrl: editing.avatarUrl,
          isPublished: editing.isPublished,
          order: editing.order,
        });
        toast.success('Updated');
      } else {
        await testimonialsApi.create({
          name: editing.name,
          subtitle: editing.subtitle,
          quote: editing.quote,
          rating: editing.rating,
          avatarUrl: editing.avatarUrl,
          isPublished: editing.isPublished,
          order: editing.order,
        });
        toast.success('Created');
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await testimonialsApi.remove(id);
      toast.success('Deleted');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
        <button onClick={startCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{it.order}</td>
                <td className="px-4 py-3 text-sm text-gray-900 flex items-center space-x-3">
                  <img src={it.avatarUrl || 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'} alt={it.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="font-medium">{it.name}</div>
                    {it.subtitle && <div className="text-xs text-gray-500">{it.subtitle}</div>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-lg truncate">{it.quote}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.round(it.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{it.isPublished ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(it)} className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded mr-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(it.id)} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input value={editing.name} onChange={(e)=>setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input value={editing.subtitle ?? ''} onChange={(e)=>setEditing({ ...editing, subtitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                  <textarea value={editing.quote} onChange={(e)=>setEditing({ ...editing, quote: e.target.value })} rows={4} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={editing.rating} onChange={(e)=>setEditing({ ...editing, rating: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={editing.order} onChange={(e)=>setEditing({ ...editing, order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                  <input value={editing.avatarUrl ?? ''} onChange={(e)=>setEditing({ ...editing, avatarUrl: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={editing.isPublished} onChange={(e)=>setEditing({ ...editing, isPublished: e.target.checked })} />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end space-x-2">
              <button onClick={cancelEdit} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button disabled={saving} onClick={saveEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
