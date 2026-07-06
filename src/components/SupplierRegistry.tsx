import { useState, useMemo, useContext } from 'react';
import { CategoryData } from '../types';
import { formatCurrency, getRiskBgColor, getRiskColor, cn } from '../lib/utils';
import { Search, ArrowUpDown } from 'lucide-react';
import { Drawer } from './Drawer';
import { PrintModeContext } from '../lib/context';

type SortField = 'category' | 'tier' | 'totalSales' | 'cyberRiskScore';

interface SupplierRegistryProps {
  categories: CategoryData[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  sortField?: SortField;
  onSortFieldChange?: (val: SortField) => void;
  sortDesc?: boolean;
  onSortDescChange?: (val: boolean) => void;
}

export function SupplierRegistry({ 
  categories,
  searchQuery,
  onSearchChange,
  sortField,
  onSortFieldChange,
  sortDesc,
  onSortDescChange
}: SupplierRegistryProps) {
  const isPrintMode = useContext(PrintModeContext);
  
  const [localSearch, setLocalSearch] = useState('');
  const search = searchQuery !== undefined ? searchQuery : localSearch;
  
  const [localSortField, setLocalSortField] = useState<SortField>('cyberRiskScore');
  const activeSortField = sortField !== undefined ? sortField : localSortField;
  
  const [localSortDesc, setLocalSortDesc] = useState(true);
  const activeSortDesc = sortDesc !== undefined ? sortDesc : localSortDesc;

  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const filteredData = useMemo(() => {
    let data = categories;
    if (search) {
      data = data.filter(c => c.category.toLowerCase().includes(search.toLowerCase()));
    }
    
    return data.sort((a, b) => {
      let aVal = a[activeSortField];
      let bVal = b[activeSortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return activeSortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      
      return activeSortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [categories, search, activeSortField, activeSortDesc]);

  const handleSort = (field: SortField) => {
    if (activeSortField === field) {
      if (onSortDescChange) onSortDescChange(!activeSortDesc);
      else setLocalSortDesc(!activeSortDesc);
    } else {
      if (onSortFieldChange) onSortFieldChange(field);
      else setLocalSortField(field);
      
      if (onSortDescChange) onSortDescChange(true);
      else setLocalSortDesc(true);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown className={cn("w-3 h-3 ml-1 inline-block transition-colors", activeSortField === field ? "text-indigo-400" : "text-slate-600")} />
  );

  return (
    <div className={cn("bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col", isPrintMode ? "h-auto" : "h-[calc(100vh-8rem)]")}>
      {/* Header & Search */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Supplier GRC Registry</h3>
        {!isPrintMode && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter suppliers..." 
              value={search}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                else setLocalSearch(e.target.value);
              }}
              className="bg-slate-950 border border-slate-700 text-[10px] rounded px-3 pl-8 py-1.5 w-48 text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className={cn(isPrintMode ? "" : "flex-1 overflow-auto")}>
        <table className="w-full text-left">
          <thead className={cn("bg-slate-950/50", isPrintMode ? "" : "sticky top-0 z-10 backdrop-blur-sm")}>
            <tr>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-300" onClick={() => handleSort('category')}>
                Entity Category <SortIcon field="category" />
              </th>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-300" onClick={() => handleSort('tier')}>
                Tier <SortIcon field="tier" />
              </th>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase text-center cursor-pointer hover:text-slate-300" onClick={() => handleSort('cyberRiskScore')}>
                Risk Score <SortIcon field="cyberRiskScore" />
              </th>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">
                ISO / NIST
              </th>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase">
                Status
              </th>
              <th className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase text-right cursor-pointer hover:text-slate-300" onClick={() => handleSort('totalSales')}>
                Spend Vol. <SortIcon field="totalSales" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredData.map((cat, i) => (
              <tr 
                key={i} 
                onClick={() => setSelectedCategory(cat)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="px-5 py-2 text-xs font-medium text-slate-300">{cat.category}</td>
                <td className="px-5 py-2 text-[10px] text-slate-500">Tier {cat.tier}</td>
                <td className="px-5 py-2 text-xs text-center font-bold">
                  <span className={getRiskColor(cat.riskLevel)}>{cat.cyberRiskScore}</span>
                </td>
                <td className="px-5 py-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", cat.iso27001 ? "bg-emerald-400" : "bg-slate-700")} title="ISO 27001" />
                    <div className={cn("w-1.5 h-1.5 rounded-full", cat.nist ? "bg-emerald-400" : "bg-slate-700")} title="NIST CSF" />
                  </div>
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
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-[11px] text-slate-500">
            No suppliers found matching your search.
          </div>
        )}
      </div>

      <Drawer 
        isOpen={!!selectedCategory} 
        onClose={() => setSelectedCategory(null)} 
        category={selectedCategory} 
      />
    </div>
  );
}
