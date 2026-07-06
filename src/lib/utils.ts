import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'Low': return 'text-emerald-400';
    case 'Moderate': return 'text-yellow-400';
    case 'High': return 'text-orange-400';
    case 'Critical': return 'text-rose-400';
    default: return 'text-slate-400';
  }
}

export function getRiskBgColor(level: string): string {
  switch (level) {
    case 'Low': return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    case 'Moderate': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
    case 'High': return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
    case 'Critical': return 'bg-rose-400/10 text-rose-400 border-rose-400/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
