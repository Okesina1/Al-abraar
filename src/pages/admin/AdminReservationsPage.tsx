import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { availabilityApi } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

export const AdminReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [filterUstaadh, setFilterUstaadh] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await availabilityApi.getReservations(filterUstaadh || undefined, filterDate || undefined);
      setReservations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load reservations', e);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reservation?')) return;
    try {
      await availabilityApi.deleteReservation(id);
      toast.success('Reservation deleted');
      fetchReservations();
    } catch (e) {
      console.error('Failed to delete reservation', e);
      toast.error('Failed to delete reservation');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Reservations</h2>
        <div className="flex space-x-2">
          <input value={filterUstaadh} onChange={(e) => setFilterUstaadh(e.target.value)} placeholder="Ustaadh ID" className="p-2 border rounded" />
          <input value={filterDate} onChange={(e) => setFilterDate(e.target.value)} type="date" className="p-2 border rounded" />
          <button onClick={fetchReservations} className="px-3 py-2 bg-green-600 text-white rounded">Filter</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2">Ustaadh</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Start</th>
                <th className="px-3 py-2">End</th>
                <th className="px-3 py-2">Reserved Until</th>
                <th className="px-3 py-2">Booking</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-3 py-2">{r.ustaadhId?.toString?.() || r.ustaadhId}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.startTime}</td>
                  <td className="px-3 py-2">{r.endTime}</td>
                  <td className="px-3 py-2">{r.reservedUntil ? new Date(r.reservedUntil).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">{r.bookingId ? r.bookingId.toString() : '—'}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDelete(r._id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
