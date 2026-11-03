import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingModal } from '../components/bookings/BookingModal';
import { RoomModal } from '../components/rooms/RoomModal';
import { InvoiceModal } from '../components/billing/InvoiceModal';
import { useToast } from '../context/ToastContext';
import {
  BedDouble,
  DoorOpen,
  CalendarCheck,
  CalendarX,
  DollarSign,
  Percent,
  Plus,
  RefreshCw,
  TrendingUp,
  Receipt,
  SprayCan,
  Users,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const { showToast } = useToast();

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleViewInvoice = (bill) => {
    setSelectedBill(bill);
    setShowInvoiceModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading live hotel metrics...</p>
      </div>
    );
  }

  const { summary, weeklyRevenue, roomTypeDistribution, housekeepingStats, recentBookings } =
    data || {};

  const COLORS = ['#0270c7', '#36abf8', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header bar with welcome & fast actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hotel Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time room occupancy, live billing revenue, and daily guest turnover
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Exactly matching all 8 requirements in prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <StatCard
          title="Total Rooms"
          value={summary?.totalRooms || 0}
          subtitle="Full property inventory"
          icon={BedDouble}
          color="blue"
        />

        {/* Available Rooms */}
        <StatCard
          title="Available Rooms"
          value={summary?.availableRooms || 0}
          subtitle="Vacant & ready to book"
          icon={DoorOpen}
          color="emerald"
        />

        {/* Occupied Rooms */}
        <StatCard
          title="Occupied Rooms"
          value={summary?.occupiedRooms || 0}
          subtitle="Currently checked-in"
          icon={Users}
          color="indigo"
        />

        {/* Reserved Rooms */}
        <StatCard
          title="Reserved Rooms"
          value={summary?.reservedRooms || 0}
          subtitle="Confirmed upcoming"
          icon={CalendarCheck}
          color="amber"
        />

        {/* Today's Check-ins */}
        <StatCard
          title="Today's Check-ins"
          value={summary?.todaysCheckIns || 0}
          subtitle="Arrivals scheduled today"
          icon={CalendarCheck}
          color="emerald"
        />

        {/* Today's Check-outs */}
        <StatCard
          title="Today's Check-outs"
          value={summary?.todaysCheckOuts || 0}
          subtitle="Departures scheduled today"
          icon={CalendarX}
          color="rose"
        />

        {/* Total Revenue */}
        <StatCard
          title="Total Revenue"
          value={summary?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          subtitle={`+$${summary?.totalPendingBalance?.toFixed(2)} pending balance`}
          icon={DollarSign}
          color="emerald"
          prefix="$"
        />

        {/* Room Occupancy Percentage */}
        <StatCard
          title="Room Occupancy"
          value={`${summary?.occupancyRate || 0}`}
          subtitle="Occupied / Total inventory"
          icon={Percent}
          color="purple"
          suffix="%"
          trend={summary?.occupancyRate > 50 ? 'Strong Demand' : 'Standard'}
        />
      </div>

      {/* Charts Section: Revenue Analytics & Room Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                7-Day Revenue & Inflow
              </h3>
              <p className="text-xs text-slate-500">
                Daily recorded payments across cash, card, and UPI
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              Live Ledger
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0270c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0270c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0270c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Type Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Room Category Distribution
            </h3>
            <p className="text-xs text-slate-500">Inventory allocation by room tier</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomTypeDistribution}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={4}
                >
                  {roomTypeDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} rooms`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            {roomTypeDistribution?.map((item, idx) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-700">{item._id}</span>
                </div>
                <span className="text-slate-500 font-bold">
                  {item.occupied} / {item.total} Occ.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Housekeeping Status Breakdown & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Housekeeping Quick Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <SprayCan className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Housekeeping Status
              </h3>
            </div>
            <a
              href="/housekeeping"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-center">
              <span className="text-2xl font-black text-emerald-700">
                {housekeepingStats?.clean || 0}
              </span>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                Clean & Ready
              </p>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 text-center">
              <span className="text-2xl font-black text-rose-700">
                {housekeepingStats?.dirty || 0}
              </span>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mt-0.5">
                Dirty (Turnover)
              </p>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-center">
              <span className="text-2xl font-black text-amber-700">
                {housekeepingStats?.cleaning || 0}
              </span>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                In Cleaning
              </p>
            </div>
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 text-center">
              <span className="text-2xl font-black text-purple-700">
                {housekeepingStats?.maintenance || 0}
              </span>
              <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mt-0.5">
                Maintenance
              </p>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Recent Bookings
              </h3>
              <p className="text-xs text-slate-500">Latest reservations and active stays</p>
            </div>
            <a
              href="/bookings"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Booking ID</th>
                  <th className="pb-3 px-2">Guest Name</th>
                  <th className="pb-3 px-2">Room</th>
                  <th className="pb-3 px-2">Duration</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings?.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-2 font-bold text-brand-700">{b.bookingId}</td>
                    <td className="py-3 px-2 font-semibold text-slate-900">{b.customer?.name}</td>
                    <td className="py-3 px-2 font-medium text-slate-600">
                      Room #{b.room?.roomNumber} ({b.room?.roomType})
                    </td>
                    <td className="py-3 px-2 text-slate-500">{b.numberOfNights} Nights</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3 px-2 text-right">
                      {b.bill && (
                        <button
                          onClick={() => handleViewInvoice(b.bill)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View Bill</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingCreated={() => {
          showToast('New booking created successfully!', 'success');
          fetchStats();
        }}
      />

      {/* Invoice Modal */}
      {selectedBill && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          bill={selectedBill}
          onBillUpdated={() => {
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
