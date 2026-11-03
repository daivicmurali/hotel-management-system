import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { HousekeepingModal } from '../components/housekeeping/HousekeepingModal';
import { useToast } from '../context/ToastContext';
import {
  SprayCan,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  UserCheck,
  Edit2,
  RefreshCw,
  BedDouble,
} from 'lucide-react';

export const Housekeeping = () => {
  const [housekeepingList, setHousekeepingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const { showToast } = useToast();

  const fetchHousekeeping = async () => {
    setLoading(true);
    try {
      const res = await api.get('/housekeeping', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        },
      });
      if (res.data.success) {
        setHousekeepingList(res.data.data);
      }
    } catch (err) {
      showToast('Error loading housekeeping records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeeping();
  }, [statusFilter, priorityFilter]);

  const handleEditStatus = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (updateData) => {
    if (!selectedRecord) return;
    setModalLoading(true);
    try {
      const res = await api.put(`/housekeeping/${selectedRecord._id}`, updateData);
      if (res.data.success) {
        showToast(
          `Room ${selectedRecord.room?.roomNumber} marked as ${updateData.status}!`,
          'success'
        );
        setIsModalOpen(false);
        fetchHousekeeping();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredList = housekeepingList.filter((item) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      item.room?.roomNumber?.toLowerCase().includes(s) ||
      item.assignedStaff?.toLowerCase().includes(s) ||
      item.room?.roomType?.toLowerCase().includes(s)
    );
  });

  const dirtyTurnoverCount = housekeepingList.filter(
    (h) => h.status === 'Dirty' || h.status === 'Cleaning'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Housekeeping Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor room sanitation, assign staff duties, and prioritize turnover cleaning after guest checkout
          </p>
        </div>

        <button
          onClick={fetchHousekeeping}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Turnover Alert Banner if rooms need cleaning */}
      {dirtyTurnoverCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">
                Turnover Cleaning Attention Needed ({dirtyTurnoverCount} Rooms)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Rooms vacated after checkout or marked Dirty require sanitation before new guests can check in.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter('Dirty')}
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors whitespace-nowrap shadow-sm"
          >
            Show Dirty Rooms Only
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by room # or staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:w-80">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Clean">Clean</option>
            <option value="Dirty">Dirty</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Housekeeping Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">
          Loading housekeeping schedule...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-2">
          <SprayCan className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No rooms match filter criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                item.status === 'Dirty'
                  ? 'border-rose-200 bg-rose-50/20'
                  : item.status === 'Cleaning'
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header: Room & Status */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Room #{item.room?.roomNumber}
                    </h3>
                    <p className="text-xs font-bold text-brand-600 mt-0.5">{item.room?.roomType}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={item.status} size="sm" />
                    <StatusBadge status={item.priority} size="sm" />
                  </div>
                </div>

                {/* Assigned Staff */}
                <div className="bg-white/80 border border-slate-100 rounded-xl p-3 mb-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Staff:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                      {item.assignedStaff || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Last Cleaned:</span>
                    <span className="text-slate-600">
                      {new Date(item.lastCleaned).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Remarks */}
                {item.remarks && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mb-3">
                    "{item.remarks}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  Floor {item.room?.floor || 1}
                </span>

                <button
                  onClick={() => handleEditStatus(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Update Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Housekeeping Edit Modal */}
      <HousekeepingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={selectedRecord}
        onSave={handleSaveStatus}
        loading={modalLoading}
      />
    </div>
  );
};
