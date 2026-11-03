import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Calendar,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  Menu,
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur">
      {/* Left: Mobile Toggle & Hotel Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
            Grand Horizon Hotel Management
          </span>
        </div>
      </div>

      {/* Middle: Live Date & Clock */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="h-3.5 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Alexander Wright'}</p>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-brand-600" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
