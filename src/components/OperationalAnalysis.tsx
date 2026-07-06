import { MonthlyData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ComposedChart, Line } from 'recharts';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { useContext } from 'react';
import { PrintModeContext } from '../lib/context';

interface OperationalAnalysisProps {
  globalMonthly: MonthlyData[];
}

export function OperationalAnalysis({ globalMonthly }: OperationalAnalysisProps) {
  const isPrintMode = useContext(PrintModeContext);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-lg text-sm">
          <p className="font-semibold text-slate-200 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-400">{p.name}:</span>
              <span className="text-slate-200 font-mono">
                {p.name.includes('Spend') || p.name.includes('Forecast') 
                  ? formatCurrency(p.value) 
                  : formatNumber(p.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("space-y-6 flex flex-col", isPrintMode ? "h-auto" : "h-[calc(100vh-8rem)]")}>
      <div className={cn("bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col", isPrintMode ? "h-96" : "flex-1 min-h-0")}>
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Macro Demand Runway</h2>
            <p className="text-sm text-slate-500">Historical transaction volume vs forward-looking forecast bounds.</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
               <span className="text-slate-400">Actual Spend</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 border-t-2 border-dashed border-slate-400" />
               <span className="text-slate-400">Forecast Target</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-3 h-3 bg-slate-700/50 rounded-sm border border-slate-600" />
               <span className="text-slate-400">±10% Variance</span>
             </div>
          </div>
        </div>
        
        <div className={cn("min-h-0", isPrintMode ? "h-72" : "flex-1")}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={globalMonthly} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorSalesOp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
              
              {/* Variance Bounds */}
              <Area yAxisId="left" type="monotone" dataKey="upperBound" stroke="none" fill="#334155" fillOpacity={0.15} name="Upper Bound" isAnimationActive={false} />
              <Area yAxisId="left" type="monotone" dataKey="lowerBound" stroke="none" fill="#0f172a" fillOpacity={1} name="Lower Bound" isAnimationActive={false} />
              
              {/* Actuals */}
              <Area yAxisId="left" type="monotone" dataKey="sales" name="Actual Spend" stroke="#818cf8" strokeWidth={3} fill="url(#colorSalesOp)" isAnimationActive={false} />
              
              {/* Forecast Line */}
              <Line yAxisId="left" type="monotone" dataKey="forecast" name="Forecast Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-72">
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
           <h3 className="text-sm font-semibold text-slate-100 mb-4">Logistics Lead Time Variance</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={globalMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
               <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
               <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(2)} />
               <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(value: number) => value.toFixed(2)} />
               <Legend wrapperStyle={{ fontSize: '12px' }} />
               <Bar dataKey="avgScheduledDays" name="Scheduled Days" fill="#3b82f6" radius={[2, 2, 0, 0]} isAnimationActive={false} />
               <Bar dataKey="avgRealDays" name="Actual Days" fill="#f43f5e" radius={[2, 2, 0, 0]} isAnimationActive={false} />
             </BarChart>
           </ResponsiveContainer>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
           <h3 className="text-sm font-semibold text-slate-100 mb-4">Transaction Volume</h3>
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={globalMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
               <defs>
                 <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
               <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
               <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
               <Tooltip cursor={{ stroke: '#334155' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
               <Area type="monotone" dataKey="orders" name="Order Volume" stroke="#10b981" strokeWidth={2} fill="url(#colorOrders)" isAnimationActive={false} />
             </AreaChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
