import { RawDataRow } from '../types';

function generateMockData(): RawDataRow[] {
  const data: RawDataRow[] = [];
  const categories = [
    "Semiconductors", "HVAC Parts", "Raw Steel", "Aluminum Extrusions", 
    "Logistics Software", "Packaging Materials", "Chemical Solvents", "Industrial Lubricants",
    "Microcontrollers", "Electric Motors", "Fasteners", "Optical Lenses",
    "Carbon Fiber", "Polymers", "Wiring Harnesses", "Battery Cells"
  ];
  const regions = ["North America", "Europe", "APAC", "LATAM"];

  // Generate for 12 months (2023)
  for (let month = 1; month <= 12; month++) {
    const monthStr = `2023-${String(month).padStart(2, '0')}`;
    
    categories.forEach(category => {
      // Create 5-20 orders per category per month
      const numOrders = Math.floor(Math.random() * 15) + 5;
      
      for (let i = 0; i < numOrders; i++) {
        // Base days
        const scheduledShippingDays = Math.floor(Math.random() * 5) + 1; 
        
        // Add some random delays, worse in later months or specific categories
        let delayProb = 0.2;
        if (category === "Semiconductors" || category === "Battery Cells") delayProb = 0.5;
        if (month > 9) delayProb += 0.2; // Holiday season

        const realShippingDays = scheduledShippingDays + (Math.random() < delayProb ? Math.floor(Math.random() * 4) + 1 : 0);
        
        const lateDeliveryRisk = realShippingDays > scheduledShippingDays ? 1 : 0;
        
        // Sales volume varies
        let baseSales = Math.random() * 5000 + 1000;
        if (category === "Semiconductors") baseSales *= 3;
        
        data.push({
          realShippingDays,
          scheduledShippingDays,
          lateDeliveryRisk,
          category,
          region: regions[Math.floor(Math.random() * regions.length)],
          sales: baseSales,
          orderDate: `${monthStr}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
        });
      }
    });
  }

  return data;
}

export const fallbackMockData = generateMockData();
