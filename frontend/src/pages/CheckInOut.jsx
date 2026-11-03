import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/billing/InvoiceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  UserCheck,
  UserMinus,
  Calendar,
  Clock,
  BedDouble,
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react';

export const CheckInOut = () => {
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'inhouse' | 'checkout' | 'history'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Bill modal for checkout billing
  const [selectedBill, setSelectedBill] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Check-out confirmation
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      showToast('Error loading bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Process Check-In
  const handleCheckIn = async (bookingId, roomNumber) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/check-in`);
      if (res.data.success) {
        showToast(`Guest checked in! Room #${roomNumber} is now Occupied.`, 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  // Process Check-Out
  const handleConfirmCheckout = async () => {
    if (!checkoutBooking) return;
    setProcessingCheckout(true);

    try {
      const res = await api.put(`/bookings/${checkoutBooking._id}/check-out`);
      if (res.data.success) {
        showToast(
          `Checkout complete for Room #${checkoutBooking.room?.roomNumber}! Marked as Dirty for housekeeping.`,
          'success'
        );
        setCheckoutBooking(null);
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setProcessingCheckout(false);
    }
  };

  // Filter lists based on tab
  const filteredList = React.useMemo(() => {
    let list = bookings;

    if (activeTab === 'checkin') {
      list = bookings.filter((b) => b.status === 'Reserved');
    } else if (activeTab === 'inhouse') {
      list = bookings.filter((b) => b.status === 'Checked-In');
    } else if (activeTab === 'checkout') {
      // Due for checkout today or checked-in
      const today = new Date().toISOString().split('T')[0];
      list = bookings.filter((b) => b.status === 'Checked-In');
    } else if (activeTab === 'history') {
      list = bookings.filter((b) => b.status === 'Checked-Out' || b.status === 'Cancelled');
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingId?.toLowerCase().includes(s) ||
          b.customer?.name?.toLowerCase().includes(s) ||
          b.customer?.phone?.toLowerCase().includes(s) ||
          b.room?.roomNumber?.toLowerCase().includes(s)
      );
    }

    return list;
  }, [bookings, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Check-in & Check-out Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Process arrivals, oversee in-house guests, finalize dynamic bills & release rooms for housekeeping
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'checkin'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Upcoming Check-ins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-700/60 text-white">
              {bookings.filter((b) => b.status === 'Reserved').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inhouse')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inhouse'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>In-House Guests</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-700/60 text-white">
              {bookings.filter((b) => b.status === 'Checked-In').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'checkout'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserMinus className="w-4 h-4" />
            <span>Process Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Completed History</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by guest, room, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* List content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading guest reservations...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No records found for this view</p>
            <p className="text-xs text-slate-400">All arrivals and departures are up to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Assigned Room</th>
                  <th className="py-3.5 px-4">Dates / Duration</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Bill Balance</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-brand-700">
                      {b.bookingId}
                      <p className="text-[10px] text-slate-400 font-normal">
                        Booked: {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-sm">{b.customer?.name}</p>
                      <p className="text-[11px] text-slate-500">{b.customer?.phone}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">Room #{b.room?.roomNumber}</span>
                      <p className="text-[11px] font-semibold text-brand-600">{b.room?.roomType}</p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-700">
                        {new Date(b.checkInDate).toLocaleDateString()} →{' '}
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {b.numberOfNights} Nights • {b.numberOfGuests} Guests
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={b.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-right">
                      {b.bill ? (
                        <div>
                          <span
                            className={`font-black text-xs ${
                              b.bill.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            ${Number(b.bill.balanceAmount || 0).toFixed(2)} Due
                          </span>
                          <p className="text-[10px] text-slate-400">
                            Total: ${Number(b.bill.grandTotal || 0).toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'Reserved' && (
                          <button
                            onClick={() => handleCheckIn(b._id, b.room?.roomNumber)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}

                        {b.status === 'Checked-In' && (
                          <button
                            onClick={() => setCheckoutBooking(b)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Check-Out</span>
                          </button>
                        )}

                        {b.bill && (
                          <button
                            onClick={() => {
                              setSelectedBill(b.bill);
                              setShowInvoiceModal(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                            title="Review Dynamic Bill"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Bill</span>
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

      {/* Invoice Modal */}
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

      {/* Checkout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!checkoutBooking}
        onClose={() => setCheckoutBooking(null)}
        onConfirm={handleConfirmCheckout}
        title={`Check-out Room #${checkoutBooking?.room?.roomNumber}?`}
        message={`Confirm check-out for ${checkoutBooking?.customer?.name}. This will finalize the bill, release the room, and mark Room #${checkoutBooking?.room?.roomNumber} as 'Dirty' for housekeeping turnover.`}
        confirmText="Confirm Check-Out"
        loading={processingCheckout}
      />
    </div>
  );
};
