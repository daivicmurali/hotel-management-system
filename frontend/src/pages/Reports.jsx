import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Percent,
  Calendar,
  Sparkles,
  CreditCard,
  BedDouble,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export const Reports = () => {
  const [range, setRange] = useState('30days');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/analytics', {
        params: { range },
      });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      showToast('Error loading report analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const COLORS = ['#0270c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const { trendData, servicesRevenueByCategory, paymentMethods, roomTypeStats } =
    reportData || {};

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Occupancy Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statistical business intelligence on room turnover, revenue channels & service sales
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm self-start sm:self-auto">
          {[
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: '90days', label: 'Last Quarter (90D)' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                range === r.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Compiling occupancy records...</p>
        </div>
      ) : (
        <>
          {/* Main Chart: Daily Occupancy % & Daily Revenue Composed Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Daily Room Occupancy Rate & Revenue Correlation
                </h3>
                <p className="text-xs text-slate-500">
                  Dual-axis analysis showing room occupancy % (Line) vs Collected Revenue (Bars)
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" />
                  Revenue ($)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
                  Occupancy (%)
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    fontSize={10}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val, name) => [
                      name === 'Revenue' ? `$${Number(val).toFixed(2)}` : `${val}%`,
                      name,
                    ]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={18}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancyRate"
                    name="Occupancy %"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Middle Row: Services Revenue Breakdown & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Additional Services Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Additional Services Revenue by Category
                </h3>
                <p className="text-xs text-slate-500">
                  Food, laundry, spa, and room service revenue share
                </p>
              </div>

              {servicesRevenueByCategory?.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No additional services billed yet
                </div>
              ) : (
                <div className="space-y-3">
                  {servicesRevenueByCategory?.map((item, idx) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{item._id}</span>
                        <span className="font-black text-slate-900">
                          ${item.totalRevenue.toFixed(2)}{' '}
                          <span className="text-slate-400 font-normal">({item.orderCount} orders)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.totalRevenue /
                                (servicesRevenueByCategory[0]?.totalRevenue || 1)) *
                                100
                            )}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Payment Gateway & Channel Distribution
                </h3>
                <p className="text-xs text-slate-500">Share of Cash vs Card vs UPI transactions</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      dataKey="totalAmount"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={35}
                      paddingAngle={5}
                    >
                      {paymentMethods?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`$${Number(val).toFixed(2)}`, name]}
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

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {paymentMethods?.map((pm, idx) => (
                  <div
                    key={pm._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-bold text-slate-700">{pm._id}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ${pm.totalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: Room Type Performance Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Room Category Performance Summary
              </h3>
              <p className="text-xs text-slate-500">
                Bookings volume, cumulative room revenue, and average length of stay per category
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Room Category</th>
                    <th className="py-3 px-4 text-center">Total Bookings</th>
                    <th className="py-3 px-4 text-center">Avg. Length of Stay</th>
                    <th className="py-3 px-4 text-right">Room Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomTypeStats?.map((stat) => (
                    <tr key={stat._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{stat._id}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {stat.totalBookings}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {stat.avgNights ? stat.avgNights.toFixed(1) : 0} Nights
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ${stat.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
