import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { BedDouble, Calendar, Check, Search, User } from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, onBookingCreated, initialRoom = null }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');

  const [checkInDate, setCheckInDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(dayAfter.toISOString().split('T')[0]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoom?._id || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [availableRooms, setAvailableRooms] = useState([]);
  const [searchingRooms, setSearchingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate number of nights
  const nights = React.useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const cin = new Date(checkInDate);
    const cout = new Date(checkOutDate);
    const diff = (cout - cin) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 1;
  }, [checkInDate, checkOutDate]);

  // Query available rooms dynamically when dates or type changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchAvailable = async () => {
      setSearchingRooms(true);
      setError('');
      try {
        const res = await api.get('/rooms/check-availability', {
          params: {
            checkInDate,
            checkOutDate,
            roomType: roomTypeFilter !== 'All' ? roomTypeFilter : undefined,
            guests: numberOfGuests,
          },
        });
        if (res.data.success) {
          setAvailableRooms(res.data.data);
          // If initialRoom was provided and is still in available rooms, keep it
          if (initialRoom && res.data.data.some((r) => r._id === initialRoom._id)) {
            setSelectedRoomId(initialRoom._id);
          } else if (res.data.data.length > 0 && !selectedRoomId) {
            setSelectedRoomId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch available rooms for dates');
      } finally {
        setSearchingRooms(false);
      }
    };

    fetchAvailable();
  }, [isOpen, checkInDate, checkOutDate, roomTypeFilter, numberOfGuests, initialRoom]);

  const selectedRoom = availableRooms.find((r) => r._id === selectedRoomId);
  const roomPricePerNight = selectedRoom?.pricePerNight || 0;
  const roomCharges = roomPricePerNight * nights;
  const estimatedTax = Number(((roomCharges * 12) / 100).toFixed(2));
  const estimatedTotal = Number((roomCharges + estimatedTax).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select an available room');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings', {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        idType,
        idNumber,
        roomId: selectedRoomId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests,
      });

      if (res.data.success) {
        onBookingCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Reservation"
      subtitle="Real-time room availability verification and automatic billing calculation"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Section 1: Customer Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            <User className="w-4 h-4 text-brand-600" />
            <span>1. Guest Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+1 555-0199"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ID Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium bg-white"
              >
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="National ID">National ID</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">ID Document Number</label>
              <input
                type="text"
                placeholder="ID / Passport #"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Postal Address</label>
              <input
                type="text"
                placeholder="City, State / Country"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dates & Guest Count */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>2. Stay Dates & Party Size</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check-in Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Check-out Date *</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
              <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-brand-600">
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Guests *</label>
              <input
                type="number"
                min="1"
                max="8"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Available Room Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <BedDouble className="w-4 h-4 text-brand-600" />
              <span>3. Select Room ({availableRooms.length} Available)</span>
            </div>

            {/* Room Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Type:</span>
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
              >
                <option value="All">All Types</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Deluxe Room">Deluxe Room</option>
                <option value="Suite Room">Suite Room</option>
              </select>
            </div>
          </div>

          {searchingRooms ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Checking availability for selected dates...
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              No rooms match these dates and capacity. Try selecting different dates or room type.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
              {availableRooms.map((room) => {
                const isSelected = selectedRoomId === room._id;
                return (
                  <div
                    key={room._id}
                    onClick={() => setSelectedRoomId(room._id)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-left relative ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-extrabold text-base text-slate-900">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-700">{room.roomType}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Cap: {room.capacity} guests</span>
                      <span className="font-bold text-slate-900">${room.pricePerNight} / night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Special requests & Estimated Bill */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Special Requests
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Quiet room, extra towels, late arrival"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1.5">
              Live Billing Estimate
            </p>
            <div className="flex justify-between text-slate-300">
              <span>
                Room Charges ({nights} {nights === 1 ? 'night' : 'nights'} × ${roomPricePerNight}):
              </span>
              <span className="font-semibold text-white">${roomCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Tax (12% GST):</span>
              <span className="font-semibold text-white">${estimatedTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-1.5 border-t border-slate-800">
              <span>Estimated Grand Total:</span>
              <span>${estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedRoomId}
            className="px-6 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-xl shadow-md transition-colors"
          >
            {submitting ? 'Confirming...' : 'Confirm Reservation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
