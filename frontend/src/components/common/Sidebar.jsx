import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  UserCheck,
  Receipt,
  Sparkles,
  SprayCan,
  BarChart3,
  Hotel,
  X,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Room Inventory', path: '/rooms', icon: BedDouble },
  { name: 'Customer Bookings', path: '/bookings', icon: CalendarDays },
  { name: 'Check-in / Check-out', path: '/check-in-out', icon: UserCheck },
  { name: 'Dynamic Billing', path: '/billing', icon: Receipt },
  { name: 'Housekeeping', path: '/housekeeping', icon: SprayCan },
  { name: 'Additional Services', path: '/services', icon: Sparkles },
  { name: 'Occupancy Reports', path: '/reports', icon: BarChart3 },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                GRAND HORIZON
              </h1>
              <span className="text-[10px] font-semibold text-brand-300 uppercase tracking-widest">
                Hotel Management
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info widget */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="font-semibold text-white">System Status</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live / Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Connected to MongoDB</p>
          </div>
        </div>
      </aside>
    </>
  );
};
