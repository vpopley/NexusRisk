import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { MetricCard } from './MetricCard';
import { CategoryData, MonthlyData, PortfolioMetrics } from '../types';
import { formatCurrency, formatNumber, getRiskColor, getRiskBgColor, cn } from '../lib/utils';
import { BrainCircuit, Search } from 'lucide-react';
import { Drawer } from './Drawer';

interface ExecutiveOverviewProps {
  metrics: PortfolioMetrics;
  categories: CategoryData[];
  globalMonthly: MonthlyData[];
}

export function ExecutiveOverview({ metrics, categories, globalMonthly }: ExecutiveOverviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  
  const worstCategory = useMemo(() => {
    return categories.reduce((prev, current) => (prev.cyberRiskScore > current.cyberRiskScore) ? prev : current, categories[0]);
  }, [categories]);

  const scatterData = useMemo(() => {
    return categories.map(c => ({
      name: c.category,
      x: c.totalSales,
      y: c.cyberRiskScore,
      z: c.totalSales,
      riskLevel: c.riskLevel
    }));
  }, [categories]);

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
                {p.name.includes('ales') || p.name.includes('bound') 
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

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-lg text-sm">
          <p className="font-semibold text-slate-200 mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-slate-400">Sales: <span className="text-slate-200 font-mono">{formatCurrency(data.x)}</span></p>
            <p className="text-slate-400">Risk Score: <span className="text-slate-200 font-mono">{data.y}</span></p>
            <p className="text-slate-400">Level: <span className={getRiskColor(data.riskLevel)}>{data.riskLevel}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Row 1: High Density Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          title="Total Spend" 
          value={formatCurrency(metrics.totalSpend)} 
          subtitle="Total procurement volume"
        />
        <MetricCard 
          title="Unique Categories" 
          value={metrics.uniqueCategories} 
          subtitle="Managed entities"
        />
        <MetricCard 
          title="Avg Portfolio Risk" 
          value={formatNumber(metrics.averageRisk)} 
          subtitle={`Level: ${metrics.averageRisk >= 60 ? 'High' : metrics.averageRisk >= 40 ? 'Moderate' : 'Low'}`}
          highlightColor={getRiskColor(metrics.averageRisk >= 60 ? 'High' : metrics.averageRisk >= 40 ? 'Moderate' : 'Low')}
        />
        <MetricCard 
          title="High-Risk Entities" 
          value={metrics.highRiskEntities} 
          subtitle="Priority Action Required"
          highlightColor="text-rose-400"
          borderColor="border-l-4 border-l-rose-500"
        />
        <MetricCard 
          title="Avg Shipping Days" 
          value={`${formatNumber(metrics.averageShippingDays)}d`} 
          subtitle="Average actual delivery"
        />
        <MetricCard 
          title="Forecast MAPE" 
          value={`${formatNumber(100 - metrics.forecastAccuracy)}%`} 
          subtitle="High Accuracy Range"
          highlightColor="text-emerald-400"
        />
      </div>

      {/* Row 2: Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Forecast Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Demand Forecast & Reconciliation</h3>
              <p className="text-[11px] text-slate-500">3-Month Moving Average with ±10% Confidence Bounds</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Actuals</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Forecast</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={globalMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBounds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#colorBounds)" isAnimationActive={false} />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#0f172a" isAnimationActive={false} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorSales)" isAnimationActive={false} />
                <Area type="monotone" dataKey="forecast" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" fill="none" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Risk Matrix */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Supplier Risk Matrix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Sales" stroke="#475569" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                <YAxis type="number" dataKey="y" name="Risk Score" stroke="#475569" fontSize={10} domain={[0, 100]} />
                <ZAxis type="number" dataKey="z" range={[20, 200]} name="Volume" />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#334155' }} />
                {['Low', 'Moderate', 'High', 'Critical'].map(level => (
                  <Scatter 
                    key={level}
                    name={level}
                    data={scatterData.filter(d => d.riskLevel === level)} 
                    fill={level === 'Low' ? '#34d399' : level === 'Moderate' ? '#fbbf24' : level === 'High' ? '#fb923c' : '#fb7185'} 
                    fillOpacity={0.6}
                    isAnimationActive={false}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Table & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Insights Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">AI Intelligence Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Category <span className="text-indigo-400 font-semibold">{worstCategory?.category}</span> flags the highest overall Supplier Cyber Risk (<span className="text-rose-400 font-bold">{worstCategory?.cyberRiskScore}</span>) driven by systemic late delivery patterns and high procurement spend exposure. Recommend ISO27001 audit.
            </p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase mb-3">Compliance Drift</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-300">NIST 800-53 Baseline</span>
                  <span className="text-xs text-emerald-400 font-medium">92%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-300">ISO 27001 Controls</span>
                  <span className="text-xs text-yellow-400 font-medium">64%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Registry Table Preview */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Supplier GRC Registry Preview</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase">Entity Category</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase">Tier</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">Risk Score</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase text-right">Spend Vol.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.slice(0, 5).map((cat, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <td className="px-5 py-2 text-xs font-medium text-slate-300">{cat.category}</td>
                    <td className="px-5 py-2 text-[10px] text-slate-500">Tier {cat.tier}</td>
                    <td className="px-5 py-2 text-xs text-center font-bold">
                      <span className={getRiskColor(cat.riskLevel)}>{cat.cyberRiskScore}</span>
                    </td>
                    <td className="px-5 py-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border", getRiskBgColor(cat.riskLevel))}>
                        {cat.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-xs text-right text-slate-400">{formatCurrency(cat.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Drawer 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)} 
        category={selectedCategory} 
      />
    </div>
  );
}
