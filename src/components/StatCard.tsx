import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
  subtitle?: string;
}

const colorClasses = {
  primary: 'from-indigo-600 to-indigo-500',
  success: 'from-green-600 to-emerald-500',
  warning: 'from-amber-500 to-orange-500',
  error: 'from-red-500 to-pink-500',
};

const glowClasses = {
  primary: 'shadow-indigo-500/10 hover:shadow-indigo-500/20',
  success: 'shadow-green-500/10 hover:shadow-green-500/20',
  warning: 'shadow-amber-500/10 hover:shadow-amber-500/20',
  error: 'shadow-red-500/10 hover:shadow-red-500/20',
};

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  subtitle,
}: StatCardProps) {
  return (
    <div className={`card-elevated p-6 hover-lift group shadow-lg ${glowClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold mt-1.5 animate-countUp">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`text-sm font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-slate-400 dark:text-slate-500 font-normal text-xs ml-1">vs last week</span>
        </div>
      )}
    </div>
  );
}
