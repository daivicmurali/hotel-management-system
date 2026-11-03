import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingModal } from '../components/bookings/BookingModal';
import { InvoiceModal } from '../components/billing/InvoiceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  CalendarDays,
  Search,
  Plus,
  Filter,
  Receipt,
  UserCheck,
  Ban,
  Calendar,
  User,
  BedDouble,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
      });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error loading bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter]);

  const handleCheckIn = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/check-in`);
      if (res.data.success) {
        showToast(res.data.message || 'Guest checked in successfully!', 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      const res = await api.put(`/bookings/${bookingToCancel._id}/cancel`);
      if (res.data.success) {
        showToast(res.data.message || 'Booking cancelled successfully', 'success');
        setBookingToCancel(null);
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleViewInvoice = async (billId) => {
    try {
      const res = await api.get(`/bills/${billId}`);
      if (res.data.success) {
        setSelectedBill(res.data.data);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      showToast('Error loading invoice', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create reservations with real-time overlap prevention, live rate calculation & invoice generation
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Booking ID, Guest Name, Phone or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Booking Statuses</option>
            <option value="Reserved">Reserved</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No bookings found</p>
            <p className="text-xs text-slate-400">
              Create a new reservation to book an available room for a guest.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest Info</th>
                  <th className="py-3.5 px-4">Room Reserved</th>
                  <th className="py-3.5 px-4">Dates & Duration</th>
                  <th className="py-3.5 px-4 text-right">Charges</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Booking ID */}
                    <td className="py-4 px-4 font-extrabold text-brand-700">
                      <span>{b.bookingId}</span>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Booked: {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-sm">{b.customer?.name}</p>
                      <div className="flex flex-col text-[11px] text-slate-500 mt-0.5 gap-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {b.customer?.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {b.customer?.email}
                        </span>
                      </div>
                    </td>

                    {/* Room */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">
                        Room #{b.room?.roomNumber}
                      </span>
                      <p className="text-[11px] font-semibold text-brand-600">{b.room?.roomType}</p>
                      <span className="text-[10px] text-slate-400">
                        {b.numberOfGuests} Guests • Floor {b.room?.floor || 1}
                      </span>
                    </td>

                    {/* Stay Dates */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(b.checkInDate).toLocaleDateString()} →{' '}
                          {new Date(b.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 mt-0.5 inline-block">
                        {b.numberOfNights} {b.numberOfNights === 1 ? 'Night' : 'Nights'}
                      </span>
                    </td>

                    {/* Total Room Charges */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-extrabold text-sm text-slate-900">
                        ${b.totalRoomCharges?.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        (${b.roomPricePerNight}/night)
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'Reserved' && (
                          <button
                            onClick={() => handleCheckIn(b._id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Check In guest"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Check-In</span>
                          </button>
                        )}

                        {b.bill && (
                          <button
                            onClick={() => handleViewInvoice(b.bill._id || b.bill)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                            title="View / Edit Bill"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Bill</span>
                          </button>
                        )}

                        {b.status === 'Reserved' && (
                          <button
                            onClick={() => setBookingToCancel(b)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel Reservation"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking creation modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingCreated={() => {
          showToast('Reservation confirmed successfully!', 'success');
          fetchBookings();
        }}
      />

      {/* Invoice modal */}
      {selectedBill && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          bill={selectedBill}
          onBillUpdated={() => {
            fetchBookings();
          }}
        />
      )}

      {/* Cancel dialog */}
      <ConfirmDialog
        isOpen={!!bookingToCancel}
        onClose={() => setBookingToCancel(null)}
        onConfirm={handleCancelBooking}
        title={`Cancel Booking ${bookingToCancel?.bookingId}?`}
        message={`Are you sure you want to cancel the reservation for ${bookingToCancel?.customer?.name}? This will free Room ${bookingToCancel?.room?.roomNumber} for other guests.`}
        confirmText="Cancel Reservation"
        isDangerous
        loading={cancelling}
      />
    </div>
  );
};
