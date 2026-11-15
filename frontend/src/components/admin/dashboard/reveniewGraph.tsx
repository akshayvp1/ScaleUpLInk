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
    <Card className="border-border/70 bg-card shadow-soft">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Revenue overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly performance over the last 12 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
            percentageChange >= 0
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}>
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            {percentageChange.toFixed(1)}%
            <span className="ml-1 font-normal text-muted-foreground">vs last month</span>
          </div>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-muted/35 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Monthly revenue
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(currentMonth.revenue)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/35 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total revenue (12 months)
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Custom graph visualization using SVG */}
        <div className="mt-6 h-64 w-full">
          <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--success)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g>
              {[0, 1, 2, 3, 4].map((line) => (
                <line
                  key={line}
                  x1="0"
                  y1={50 * line + 50}
                  x2="800"
                  y2={50 * line + 50}
                  stroke="color-mix(in srgb, var(--border) 45%, transparent)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              ))}
            </g>

            <path
              d={`${revenueData.map((data, index) => {
                const x = (index / (revenueData.length - 1)) * 800;
                const y = 250 - ((data.revenue / maxRevenue) * 200);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} L 800 250 L 0 250 Z`}
              fill="url(#revenueArea)"
            />

            <path
              d={revenueData.map((data, index) => {
                const x = (index / (revenueData.length - 1)) * 800;
                const y = 250 - ((data.revenue / maxRevenue) * 200);
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {revenueData.map((data, index) => {
              const x = (index / (revenueData.length - 1)) * 800;
              const y = 250 - ((data.revenue / maxRevenue) * 200);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="var(--card)"
                  stroke="var(--success)"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
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