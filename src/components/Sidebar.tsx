import { LayoutDashboard, ShieldAlert, Activity, Settings, Database, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'registry', label: 'Supplier GRC Registry', icon: ShieldAlert },
    { id: 'operations', label: 'Demand Forecast', icon: Activity },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-16 flex flex-col items-center py-6 bg-slate-900 border-r border-slate-800 shrink-0 h-screen">
      <div className="mb-8">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">N</div>
      </div>
      
      <nav className="flex flex-col gap-6 w-full px-3 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.label}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer flex justify-center items-center w-10 h-10",
                isActive 
                  ? "bg-indigo-600/20 text-indigo-400" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      <div className="mt-auto mb-4 flex flex-col gap-6 items-center w-full px-3">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={item.label}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex justify-center items-center w-10 h-10"
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        {/* Sticky Footer User Profile Branding */}
        <div className="mt-4 pt-6 border-t border-slate-800/60 w-full overflow-visible">
          <div className="flex items-center justify-center w-full cursor-default">
            {/* Initials Avatar Ring */}
            <a 
              href="https://vidhipopley.my.canva.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold tracking-tight shadow-sm shrink-0 transition-colors hover:bg-emerald-500/20"
              title="Vidhi Popley - Lead Risk Architect"
            >
              VP
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
