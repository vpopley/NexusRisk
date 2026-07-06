import { X, ShieldCheck, ShieldAlert, Activity, Server, FileText } from 'lucide-react';
import { CategoryData } from '../types';
import { cn, formatCurrency, getRiskColor, getRiskBgColor } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryData | null;
}

export function Drawer({ isOpen, onClose, category }: DrawerProps) {
  if (!isOpen || !category) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">{category.category}</h2>
              <p className="text-sm text-slate-400 mt-1">Tier {category.tier} Supplier Profile</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
             <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Score</span>
               <span className={cn("text-3xl font-black", getRiskColor(category.riskLevel))}>{category.cyberRiskScore}</span>
             </div>
             <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center">
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</span>
               <span className={cn("px-3 py-1 rounded-full text-sm font-bold border", getRiskBgColor(category.riskLevel))}>
                 {category.riskLevel}
               </span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* AI Narrative */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                AI Risk Narrative
              </h3>
              <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-lg">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {category.category} is currently rated as <strong className={getRiskColor(category.riskLevel)}>{category.riskLevel} Risk</strong>. 
                  {category.lateRiskModifier > 0 && " There is a systemic pattern of late deliveries increasing operational vulnerability."}
                  {category.scheduleRiskModifier > 0 && " Severe schedule compression (avg < 2 days) indicates timeline duress, leading to likely policy exceptions."}
                  {category.tier === 1 && " As a Tier 1 supplier, any disruption poses a critical systemic threat to the portfolio."}
                  {category.iso27001 ? " They maintain ISO 27001 certification, providing baseline security assurance." : " They lack verifiable ISO 27001 certification, a critical control gap."}
                </p>
              </div>
            </div>

            {/* Risk Factor Breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Risk Modifiers
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">Base Risk (Calculated)</span>
                  <span className="text-sm font-mono text-slate-300">{category.baseRisk}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">Operational Failure Penalty</span>
                  <span className={cn("text-sm font-mono font-bold", category.lateRiskModifier > 0 ? "text-red-400" : "text-slate-500")}>+{category.lateRiskModifier}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">Timeline Duress Penalty</span>
                  <span className={cn("text-sm font-mono font-bold", category.scheduleRiskModifier > 0 ? "text-orange-400" : "text-slate-500")}>+{category.scheduleRiskModifier}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">Systemic Criticality Penalty</span>
                  <span className={cn("text-sm font-mono font-bold", category.criticalityModifier > 0 ? "text-yellow-400" : "text-slate-500")}>+{category.criticalityModifier}</span>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Framework Compliance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 <div className={cn("p-3 rounded border flex flex-col items-center justify-center text-center", category.iso27001 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500")}>
                    <ShieldCheck className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase">ISO 27001</span>
                 </div>
                 <div className={cn("p-3 rounded border flex flex-col items-center justify-center text-center", category.nist ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-500")}>
                    <Server className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold uppercase">NIST CSF</span>
                 </div>
              </div>
            </div>

            {/* Delivery Trend */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Delivery Performance Trend
              </h3>
              <div className="h-48 bg-slate-950 border border-slate-800 rounded p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={category.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="avgRealDays" name="Actual Days" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avgScheduledDays" name="Sched Days" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
