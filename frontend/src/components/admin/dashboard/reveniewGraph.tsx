import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ArrowUpRight, Download } from 'lucide-react';
import { cn } from '../../../lib/utils'; // Assuming this is where cn is defined

// Sample revenue data for the past 12 months
const revenueData = [
  { month: 'Apr', revenue: 42500 },
  { month: 'May', revenue: 47800 },
  { month: 'Jun', revenue: 54200 },
  { month: 'Jul', revenue: 58900 },
  { month: 'Aug', revenue: 61200 },
  { month: 'Sep', revenue: 67500 },
  { month: 'Oct', revenue: 72400 },
  { month: 'Nov', revenue: 79800 },
  { month: 'Dec', revenue: 88600 },
  { month: 'Jan', revenue: 96300 },
  { month: 'Feb', revenue: 102500 },
  { month: 'Mar', revenue: 112700 },
];

// Calculate revenue metrics
const currentMonth = revenueData[revenueData.length - 1];
const previousMonth = revenueData[revenueData.length - 2];
const percentageChange = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

const RevenueGraph: React.FC = () => {
  // Find max revenue for scaling
  const maxRevenue = Math.max(...revenueData.map(item => item.revenue));
  
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-foreground">Revenue Overview</CardTitle>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center text-sm font-medium",
            percentageChange >= 0 ? "text-green-600" : "text-red-600"
          )}>
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {percentageChange.toFixed(1)}% 
            <span className="text-muted-foreground ml-1 font-normal">vs last month</span>
          </div>
          <button className="p-1 rounded-md hover:bg-accent">
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(currentMonth.revenue)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue (12 months)</p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
        
        {/* Custom graph visualization using SVG */}
        <div className="mt-6 h-64 w-full">
          <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="none">
            {/* Grid lines */}
            <g>
              {[0, 1, 2, 3, 4].map((line) => (
                <line 
                  key={line}
                  x1="0" 
                  y1={50 * line + 50} 
                  x2="800" 
                  y2={50 * line + 50} 
                  stroke="hsl(var(--border) / 0.2)" // Using shadcn border color with opacity
                  strokeWidth="1"
                />
              ))}
            </g>
            
            {/* Revenue line */}
            <path
              d={revenueData.map((data, index) => {
                const x = (index / (revenueData.length - 1)) * 800;
                const y = 250 - ((data.revenue / maxRevenue) * 200);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981" // Keeping green-600 equivalent
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {revenueData.map((data, index) => {
              const x = (index / (revenueData.length - 1)) * 800;
              const y = 250 - ((data.revenue / maxRevenue) * 200);
              return (
                <g key={index}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="hsl(var(--background))" // Using shadcn background
                    stroke="#10b981" // Matching the line color
                    strokeWidth="2" 
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Month labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {revenueData.map((data, index) => (
              <div key={index} style={{ width: `${100 / revenueData.length}%`, textAlign: 'center' }}>
                {data.month}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-2 flex justify-end">
          <p className="text-xs text-muted-foreground">Last 12 months</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueGraph;