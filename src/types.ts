export interface RawDataRow {
  realShippingDays: number;
  scheduledShippingDays: number;
  lateDeliveryRisk: number;
  category: string;
  region: string;
  sales: number;
  orderDate: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type Tier = 1 | 2 | 3;

export interface MonthlyData {
  month: string; // YYYY-MM
  sales: number;
  orders: number;
  avgRealDays: number;
  avgScheduledDays: number;
  forecast?: number;
  upperBound?: number;
  lowerBound?: number;
}

export interface CategoryData {
  category: string;
  totalSales: number;
  totalOrders: number;
  avgRealDays: number;
  avgScheduledDays: number;
  lateDeliveryCount: number;
  tier: Tier;
  iso27001: boolean;
  nist: boolean;
  cyberRiskScore: number;
  riskLevel: RiskLevel;
  complianceScore: number;
  monthlyTrends: MonthlyData[];
  
  // Risk Factors
  lateRiskModifier: number;
  scheduleRiskModifier: number;
  criticalityModifier: number;
  baseRisk: number;
}

export interface PortfolioMetrics {
  totalSpend: number;
  uniqueCategories: number;
  averageRisk: number;
  highRiskEntities: number;
  averageShippingDays: number;
  forecastAccuracy: number;
}
