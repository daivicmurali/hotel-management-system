import React from 'react';

export const StatusBadge = ({ status, type = 'default', size = 'md' }) => {
  const s = status || 'Unknown';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  // Room status & Booking status & Housekeeping status & Payment status colors
  switch (s) {
    case 'Available':
    case 'Clean':
    case 'Paid':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      break;
    case 'Occupied':
    case 'Checked-In':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80';
      break;
    case 'Reserved':
    case 'Partially Paid':
    case 'Cleaning':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
      break;
    case 'Dirty':
    case 'Pending':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
      break;
    case 'Maintenance':
    case 'Cancelled':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/80';
      break;
    case 'Checked-Out':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'High':
    case 'Urgent':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-300';
      break;
    case 'Medium':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
      break;
    case 'Low':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          s === 'Available' || s === 'Clean' || s === 'Paid'
            ? 'bg-emerald-500'
            : s === 'Occupied' || s === 'Checked-In'
            ? 'bg-blue-500'
            : s === 'Reserved' || s === 'Partially Paid' || s === 'Cleaning'
            ? 'bg-amber-500'
            : s === 'Dirty' || s === 'Pending' || s === 'High' || s === 'Urgent'
            ? 'bg-rose-500'
            : 'bg-slate-400'
        }`}
      />
      {s}
    </span>
  );
};
