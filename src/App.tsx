import { useState, useRef, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Sidebar } from './components/Sidebar';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { SupplierRegistry } from './components/SupplierRegistry';
import { OperationalAnalysis } from './components/OperationalAnalysis';
import { RawDataRow } from './types';
import { processData } from './lib/engine';
import { fallbackMockData } from './data/mockData';
import { Upload, FileText, CheckCircle2, Filter } from 'lucide-react';
import { cn } from './lib/utils';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { PrintModeContext } from './lib/context';

type SortField = 'category' | 'tier' | 'totalSales' | 'cyberRiskScore';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasImported, setHasImported] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Shared state for SupplierRegistry
  const [registrySearch, setRegistrySearch] = useState('');
  const [registrySortField, setRegistrySortField] = useState<SortField>('cyberRiskScore');
  const [registrySortDesc, setRegistrySortDesc] = useState(true);

  // Use state to hold the processed data
  const [rawData, setRawData] = useState<RawDataRow[]>(fallbackMockData);

  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    rawData.forEach(row => {
      if (row.region) regions.add(row.region);
    });
    return ['All Regions', ...Array.from(regions).sort()];
  }, [rawData]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    rawData.forEach(row => {
      if (row.category) categories.add(row.category);
    });
    return ['All Categories', ...Array.from(categories).sort()];
  }, [rawData]);

  const processed = useMemo(() => {
    let filteredData = rawData;
    if (selectedRegion !== 'All Regions') {
      filteredData = filteredData.filter(row => row.region === selectedRegion);
    }
    if (selectedCategory !== 'All Categories') {
      filteredData = filteredData.filter(row => row.category === selectedCategory);
    }
    return processData(filteredData);
  }, [rawData, selectedRegion, selectedCategory]);

  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: RawDataRow[] = results.data.map((row: any) => ({
          realShippingDays: row['Days for shipping (real)'] || 0,
          scheduledShippingDays: row['Days for shipment (scheduled)'] || 0,
          lateDeliveryRisk: row['Late_delivery_risk'] || 0,
          category: row['Category Name'] || 'Unknown Category',
          region: row['Order Region'] || 'Unknown Region',
          sales: row['Sales per customer'] || 0,
          orderDate: row['order date (DateOrders)'] || '2023-01-01 00:00:00'
        }));
        
        setRawData(parsedData);
        setHasImported(true);
        setIsProcessing(false);
        setSelectedRegion('All Regions');
        setSelectedCategory('All Categories');
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setIsProcessing(false);
      }
    });
  };

  const handleGenerateReport = async () => {
    setIsGeneratingPDF(true);
    
    setTimeout(async () => {
      if (!reportRef.current) {
        setIsGeneratingPDF(false);
        return;
      }
      
      try {
        // Dummy call to pre-warm html-to-image (fixes some blank rendering issues)
        await toPng(reportRef.current, { cacheBust: true, pixelRatio: 1 });
        
        const dataUrl = await toPng(reportRef.current, {
          cacheBust: true,
          backgroundColor: '#020617', // slate-950
          pixelRatio: 2,
        });
        
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));

        const pdf = new jsPDF({
          orientation: img.height > img.width ? 'portrait' : 'landscape',
          unit: 'px',
          format: [img.width, img.height]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
        pdf.save(`NexusRisk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 1500); // Give time for rendering and Recharts animations
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header area for Import */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-100 tracking-tight">NexusRisk</h1>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-400">
              {activeView === 'overview' && 'Executive Overview'}
              {activeView === 'registry' && 'Supplier GRC Registry'}
              {activeView === 'operations' && 'Demand Forecast Analytics'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px]"
              >
                {availableRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px]"
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {hasImported && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Live Data Connected
              </span>
            )}
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium text-slate-200 transition-all",
                isProcessing && "opacity-70 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-slate-200 rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Import
                </>
              )}
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingPDF}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium text-white transition-all shadow-lg shadow-indigo-500/20",
                isGeneratingPDF && "opacity-70 cursor-not-allowed"
              )}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  Report
                </>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" id="dashboard-content">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeView === 'overview' && (
              <ExecutiveOverview 
                metrics={processed.metrics} 
                categories={processed.categories} 
                globalMonthly={processed.globalMonthly} 
              />
            )}
            
            {activeView === 'registry' && (
              <SupplierRegistry 
                categories={processed.categories}
                searchQuery={registrySearch}
                onSearchChange={setRegistrySearch}
                sortField={registrySortField}
                onSortFieldChange={setRegistrySortField}
                sortDesc={registrySortDesc}
                onSortDescChange={setRegistrySortDesc}
              />
            )}
            
            {activeView === 'operations' && (
              <OperationalAnalysis globalMonthly={processed.globalMonthly} />
            )}
          </div>
        </div>
      </main>

      {/* Hidden Print Container */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
        {isGeneratingPDF && (
          <PrintModeContext.Provider value={true}>
            <div 
              ref={reportRef}
              className="w-[1200px] bg-slate-950 p-10 flex flex-col gap-12 text-slate-300 font-sans"
            >
              <div className="border-b border-slate-800 pb-6 mb-2">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">NexusRisk Portfolio Report</h1>
              <div className="flex gap-4 text-sm text-slate-400">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>Region: {selectedRegion}</span>
                <span>Category: {selectedCategory}</span>
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-indigo-500 rounded-sm"></span>Executive Overview</h2>
              <ExecutiveOverview 
                metrics={processed.metrics} 
                categories={processed.categories} 
                globalMonthly={processed.globalMonthly} 
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-emerald-500 rounded-sm"></span>Supplier GRC Registry</h2>
              <SupplierRegistry 
                categories={processed.categories}
                searchQuery={registrySearch}
                sortField={registrySortField}
                sortDesc={registrySortDesc}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-rose-500 rounded-sm"></span>Demand Forecast Analytics</h2>
              <OperationalAnalysis globalMonthly={processed.globalMonthly} />
            </section>
          </div>
        </PrintModeContext.Provider>
      )}
      </div>
    </div>
  );
}
