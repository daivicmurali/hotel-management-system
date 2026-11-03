import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

const defaultStaffList = [
  'Maria Santos',
  'David Chen',
  'Elena Rostova',
  'Carlos Ramirez',
  'Fatima Al-Mansoor',
  'James Wilson',
];

export const HousekeepingModal = ({
  isOpen,
  onClose,
  record,
  onSave,
  loading = false,
}) => {
  const [status, setStatus] = useState('Clean');
  const [assignedStaff, setAssignedStaff] = useState('Maria Santos');
  const [priority, setPriority] = useState('Medium');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (record) {
      setStatus(record.status || 'Clean');
      setAssignedStaff(record.assignedStaff || 'Maria Santos');
      setPriority(record.priority || 'Medium');
      setRemarks(record.remarks || '');
    }
  }, [record, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      status,
      assignedStaff,
      priority,
      remarks,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Housekeeping — Room ${record?.room?.roomNumber || ''}`}
      subtitle="Assign housekeeping staff, set priority, and update cleaning progress"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Cleaning Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
          >
            <option value="Clean">Clean (Ready for Guest)</option>
            <option value="Dirty">Dirty (Needs Turnover Cleaning)</option>
            <option value="Cleaning">Cleaning (In Progress)</option>
            <option value="Maintenance">Maintenance / Repair</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Assigned Housekeeper *
          </label>
          <select
            value={assignedStaff}
            onChange={(e) => setAssignedStaff(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
          >
            {defaultStaffList.map((staff) => (
              <option key={staff} value={staff}>
                {staff}
              </option>
            ))}
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  priority === p
                    ? p === 'Urgent' || p === 'High'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Notes & Remarks
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Deep carpet wash required, replenish towels and bathroom toiletries"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

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
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-xl shadow-md transition-colors"
          >
            {loading ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
