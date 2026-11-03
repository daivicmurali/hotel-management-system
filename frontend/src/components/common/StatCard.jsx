import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  prefix = '',
  suffix = '',
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70',
      iconBg: 'bg-blue-600',
      text: 'text-blue-600',
      border: 'hover:border-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconBg: 'bg-amber-600',
      text: 'text-amber-600',
      border: 'hover:border-amber-300',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconBg: 'bg-rose-600',
      text: 'text-rose-600',
      border: 'hover:border-rose-300',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      iconBg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'hover:border-indigo-300',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconBg: 'bg-purple-600',
      text: 'text-purple-600',
      border: 'hover:border-purple-300',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border} group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-bold text-slate-700">{prefix}</span>}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {suffix && <span className="text-sm font-semibold text-slate-500">{suffix}</span>}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105 ${scheme.iconBg}`}
        >
          {Icon && <Icon className="w-6 h-6 stroke-[2.2]" />}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
