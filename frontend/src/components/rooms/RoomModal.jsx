import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

const standardAmenities = [
  'High-speed Wi-Fi',
  'Smart TV',
  'Air Conditioning',
  'En-suite Bathroom',
  'Mini Bar',
  'Balcony',
  'Work Desk',
  'Coffee Maker',
  'Jacuzzi',
  'Room Safe',
];

export const RoomModal = ({ isOpen, onClose, onSave, room = null, loading = false }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'Double Room',
    pricePerNight: 120,
    capacity: 2,
    floor: 1,
    status: 'Available',
    cleaningStatus: 'Clean',
    description: '',
    amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
  });

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        roomType: room.roomType || 'Double Room',
        pricePerNight: room.pricePerNight || 120,
        capacity: room.capacity || 2,
        floor: room.floor || 1,
        status: room.status || 'Available',
        cleaningStatus: room.cleaningStatus || 'Clean',
        description: room.description || '',
        amenities: room.amenities || [],
      });
    } else {
      setFormData({
        roomNumber: '',
        roomType: 'Double Room',
        pricePerNight: 120,
        capacity: 2,
        floor: 1,
        status: 'Available',
        cleaningStatus: 'Clean',
        description: '',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
      });
    }
  }, [room, isOpen]);

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? `Edit Room ${room.roomNumber}` : 'Add New Room'}
      subtitle="Configure room inventory details, pricing, and amenities"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Room Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 101, 205, 401"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Room Type *
            </label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
            >
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Suite Room">Suite Room</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Price Per Night ($) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={formData.pricePerNight}
              onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Max Guests (Capacity) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Floor Level
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Availability Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Housekeeping Status
            </label>
            <select
              value={formData.cleaningStatus}
              onChange={(e) => setFormData({ ...formData, cleaningStatus: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
            >
              <option value="Clean">Clean</option>
              <option value="Dirty">Dirty</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Room features, view, bed size, etc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Room Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {standardAmenities.map((amenity) => {
              const active = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-xl shadow-md transition-colors"
          >
            {loading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
