import { RawDataRow, CategoryData, MonthlyData, PortfolioMetrics, RiskLevel, Tier } from '../types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function processData(rawData: RawDataRow[]): { categories: CategoryData[], globalMonthly: MonthlyData[], metrics: PortfolioMetrics } {
  // Aggregate by category
  const categoryMap = new Map<string, any>();
  const globalMonthlyMap = new Map<string, any>();

  rawData.forEach(row => {
    // Basic date parsing (fallback to 2023-01 if invalid)
    let monthStr = '2023-01';
    try {
      const date = new Date(row.orderDate);
      if (!isNaN(date.getTime())) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        monthStr = `${yyyy}-${mm}`;
      }
    } catch(e) {}

    // Global monthly
    if (!globalMonthlyMap.has(monthStr)) {
      globalMonthlyMap.set(monthStr, { month: monthStr, sales: 0, orders: 0, realDays: 0, scheduledDays: 0 });
    }
    const gMon = globalMonthlyMap.get(monthStr);
    gMon.sales += row.sales;
    gMon.orders += 1;
    gMon.realDays += row.realShippingDays;
    gMon.scheduledDays += row.scheduledShippingDays;

    // Category tracking
    if (!categoryMap.has(row.category)) {
      categoryMap.set(row.category, {
        category: row.category,
        totalSales: 0,
        totalOrders: 0,
        realDays: 0,
        scheduledDays: 0,
        lateDeliveries: 0,
        timelineDuress: 0,
        monthly: new Map<string, any>()
      });
    }
    const cat = categoryMap.get(row.category);
    cat.totalSales += row.sales;
    cat.totalOrders += 1;
    cat.realDays += row.realShippingDays;
    cat.scheduledDays += row.scheduledShippingDays;
    
    if (row.lateDeliveryRisk === 1 || row.realShippingDays > row.scheduledShippingDays) {
      cat.lateDeliveries += 1;
    }
    if (row.scheduledShippingDays <= 2) {
      cat.timelineDuress += 1;
    }

    if (!cat.monthly.has(monthStr)) {
      cat.monthly.set(monthStr, { month: monthStr, sales: 0, orders: 0, realDays: 0, scheduledDays: 0 });
    }
    const cMon = cat.monthly.get(monthStr);
    cMon.sales += row.sales;
    cMon.orders += 1;
    cMon.realDays += row.realShippingDays;
    cMon.scheduledDays += row.scheduledShippingDays;
  });

  // Calculate tiers based on sales
  const categoriesList = Array.from(categoryMap.values()).sort((a, b) => b.totalSales - a.totalSales);
  const totalCategories = categoriesList.length;
  
  const tier1Count = Math.max(1, Math.round(totalCategories * 0.2));
  const tier2Count = Math.max(1, Math.round(totalCategories * 0.3));

  const finalCategories: CategoryData[] = categoriesList.map((cat, index) => {
    let tier: Tier = 3;
    if (index < tier1Count) tier = 1;
    else if (index < tier1Count + tier2Count) tier = 2;

    const avgRealDays = cat.realDays / cat.totalOrders;
    const avgScheduledDays = cat.scheduledDays / cat.totalOrders;

    // Cyber Risk Engine
    let baseRisk = 30;
    
    // Add jitter based on category name to simulate variety
    const seed = hashCode(cat.category);
    const jitter = Math.floor(pseudoRandom(seed) * 15);
    baseRisk += jitter;

    const lateRiskModifier = (cat.lateDeliveries > 0 || avgRealDays > avgScheduledDays) ? 15 : 0;
    const scheduleRiskModifier = (cat.timelineDuress > 0 || avgScheduledDays <= 2) ? 10 : 0;
    const criticalityModifier = tier === 1 ? 15 : 0;

    const cyberRiskScore = Math.min(100, baseRisk + lateRiskModifier + scheduleRiskModifier + criticalityModifier);

    let riskLevel: RiskLevel = 'Low';
    if (cyberRiskScore >= 80) riskLevel = 'Critical';
    else if (cyberRiskScore >= 60) riskLevel = 'High';
    else if (cyberRiskScore >= 40) riskLevel = 'Moderate';

    const complianceScore = Math.max(0, Math.min(100, 100 - cyberRiskScore));

    // Framework Compliance Status
    const r1 = pseudoRandom(seed + 1);
    let isoProb = 0.35;
    if (tier === 1) isoProb = 0.90;
    else if (tier === 2) isoProb = 0.60;
    
    const iso27001 = r1 <= isoProb;
    
    const r2 = pseudoRandom(seed + 2);
    const nistProb = iso27001 ? 0.85 : 0.40;
    const nist = r2 <= nistProb;

    const monthlyTrends: MonthlyData[] = Array.from(cat.monthly.values() as IterableIterator<any>).sort((a: any, b: any) => a.month.localeCompare(b.month)).map((m: any) => ({
      month: m.month,
      sales: m.sales,
      orders: m.orders,
      avgRealDays: m.realDays / m.orders,
      avgScheduledDays: m.scheduledDays / m.orders
    }));

    return {
      category: cat.category,
      totalSales: cat.totalSales,
      totalOrders: cat.totalOrders,
      avgRealDays,
      avgScheduledDays,
      lateDeliveryCount: cat.lateDeliveries,
      tier,
      iso27001,
      nist,
      cyberRiskScore,
      riskLevel,
      complianceScore,
      monthlyTrends,
      lateRiskModifier,
      scheduleRiskModifier,
      criticalityModifier,
      baseRisk
    };
  });

  // Process Global Monthly with Forecast
  let globalMonthlyRaw = Array.from(globalMonthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  
  // Create 3-month moving average
  const globalMonthly: MonthlyData[] = globalMonthlyRaw.map((gm, i, arr) => {
    let sum = gm.sales;
    let count = 1;
    if (i >= 1) { sum += arr[i-1].sales; count++; }
    if (i >= 2) { sum += arr[i-2].sales; count++; }
    
    const forecast = sum / count;
    const upperBound = forecast * 1.10;
    const lowerBound = forecast * 0.90;

    return {
      month: gm.month,
      sales: gm.sales,
      orders: gm.orders,
      avgRealDays: gm.realDays / gm.orders,
      avgScheduledDays: gm.scheduledDays / gm.orders,
      forecast,
      upperBound,
      lowerBound
    };
  });

  // Calculate MAPE
  let totalPctError = 0;
  let errorCount = 0;
  globalMonthly.forEach(m => {
    if (m.forecast && m.sales > 0) {
      totalPctError += Math.abs((m.sales - m.forecast) / m.sales);
      errorCount++;
    }
  });
  const mape = errorCount > 0 ? (totalPctError / errorCount) * 100 : 0;
  const forecastAccuracy = Math.max(0, 100 - mape);

  const totalSpend = finalCategories.reduce((acc, c) => acc + c.totalSales, 0);
  const avgRisk = finalCategories.reduce((acc, c) => acc + c.cyberRiskScore, 0) / (totalCategories || 1);
  const highRiskEntities = finalCategories.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length;
  const overallAvgRealDays = globalMonthlyRaw.reduce((acc, m) => acc + m.realDays, 0) / Math.max(1, globalMonthlyRaw.reduce((acc, m) => acc + m.orders, 0));

  return {
    categories: finalCategories,
    globalMonthly,
    metrics: {
      totalSpend,
      uniqueCategories: totalCategories,
      averageRisk: avgRisk,
      highRiskEntities,
      averageShippingDays: overallAvgRealDays,
      forecastAccuracy
    }
  };
}
