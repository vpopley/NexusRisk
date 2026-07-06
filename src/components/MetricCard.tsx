import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlightColor?: string; // Tailwind text color class
  borderColor?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, highlightColor, borderColor }: MetricCardProps) {
  return (
    <div className={cn("bg-slate-900 p-4 border border-slate-800 rounded-xl shadow-sm", borderColor)}>
      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">{title}</p>
      <p className={cn("text-2xl font-bold text-slate-100", highlightColor)}>{value}</p>
      
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-1 text-[10px]">
          {trend && (
            <span className={trend.isPositive ? "text-emerald-400" : "text-rose-400"}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <span className="text-slate-600">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
