import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoomModal } from '../components/rooms/RoomModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  BedDouble,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchNumber, setSearchNumber] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('roomNumber_asc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms', {
        params: {
          roomNumber: searchNumber || undefined,
          roomType: selectedType !== 'All' ? selectedType : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          sortBy,
        },
      });
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error loading rooms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchNumber, selectedType, selectedStatus, sortBy]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (formData) => {
    setModalLoading(true);
    try {
      if (editingRoom) {
        const res = await api.put(`/rooms/${editingRoom._id}`, formData);
        if (res.data.success) {
          showToast(`Room ${formData.roomNumber} updated successfully`, 'success');
          setIsModalOpen(false);
          fetchRooms();
        }
      } else {
        const res = await api.post('/rooms', formData);
        if (res.data.success) {
          showToast(`Room ${formData.roomNumber} added to inventory!`, 'success');
          setIsModalOpen(false);
          fetchRooms();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving room', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/rooms/${roomToDelete._id}`);
      if (res.data.success) {
        showToast(res.data.message || 'Room deleted successfully', 'success');
        setRoomToDelete(null);
        fetchRooms();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete room', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Room Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage room categories, dynamic night pricing, amenities, and real-time status
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Room number search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room # (e.g. 101)..."
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Room Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="All">All Room Types</option>
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Suite Room">Suite Room</option>
            </select>
          </div>

          {/* Availability Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Sort By Price */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="roomNumber_asc">Sort by Room # (Ascending)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="capacity_desc">Capacity: High to Low</option>
            </select>
          </div>
        </div>

        {/* Inventory Summary Counters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing {rooms.length} rooms total:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            {rooms.filter((r) => r.status === 'Available').length} Available
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
            {rooms.filter((r) => r.status === 'Occupied').length} Occupied
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
            {rooms.filter((r) => r.status === 'Reserved').length} Reserved
          </span>
        </div>
      </div>

      {/* Rooms Cards Grid / Table */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">
          Loading rooms...
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <BedDouble className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No rooms found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try tweaking your search keyword or filter settings, or add a new room to your property.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Top: Room Number & Status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        #{room.roomNumber}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Floor {room.floor || 1}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-brand-600 mt-0.5">{room.roomType}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={room.status} size="sm" />
                    <span className="text-[10px] font-semibold text-slate-400">
                      Clean: {room.cleaningStatus}
                    </span>
                  </div>
                </div>

                {/* Price & Capacity */}
                <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Nightly Rate:</span>
                    <p className="text-base font-extrabold text-slate-900">
                      ${room.pricePerNight}{' '}
                      <span className="text-xs font-medium text-slate-500">/ night</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 font-medium">Capacity:</span>
                    <div className="flex items-center gap-1 font-bold text-slate-800 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{room.capacity} Guests</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {room.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {room.description}
                  </p>
                )}

                {/* Amenities pills */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities.slice(0, 3).map((a) => (
                      <span
                        key={a}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {a}
                      </span>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[10px] font-bold text-brand-600 px-1 py-0.5">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setRoomToDelete(room)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
        loading={modalLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteRoom}
        title={`Delete Room ${roomToDelete?.roomNumber}?`}
        message={`Are you sure you want to permanently remove Room ${roomToDelete?.roomNumber} (${roomToDelete?.roomType}) from the hotel inventory?`}
        confirmText="Delete Room"
        isDangerous
        loading={deleteLoading}
      />
    </div>
  );
};
