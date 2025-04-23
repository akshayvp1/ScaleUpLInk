import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Users, CreditCard, BadgeDollarSign, Calendar, FileText, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../../lib/utils'; // Adjust this path as needed

interface StatData {
  label: string;
  value: number | string;
  description: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const DashboardStats: React.FC = () => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalUsers = 12574;
  const premiumUsers = 3842;
  const totalRevenue = 287550;
  const eventsCount = 127;
  const postsCount = 4583;
  const blockedUsers = 89;

  const stats: StatData[] = [
    {
      label: "Total Users",
      value: formatNumber(totalUsers),
      description: "Active users on platform",
      change: 8.2,
      changeLabel: "from last month",
      icon: <Users size={18} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      label: "Premium Users",
      value: formatNumber(premiumUsers),
      description: `${Math.round((premiumUsers / totalUsers) * 100)}% conversion rate`,
      change: 12.5,
      changeLabel: "from last month",
      icon: <CreditCard size={18} />,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: `${formatCurrency(Math.round(totalRevenue / premiumUsers))} per premium user`,
      change: 15.3,
      changeLabel: "from last month",
      icon: <BadgeDollarSign size={18} />,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      label: "Events",
      value: formatNumber(eventsCount),
      description: "Total events conducted",
      change: 6.8,
      changeLabel: "from last month",
      icon: <Calendar size={18} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      label: "Total Posts",
      value: formatNumber(postsCount),
      description: "User-generated content",
      change: 9.2,
      changeLabel: "from last month",
      icon: <FileText size={18} />,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      label: "Blocked Users",
      value: formatNumber(blockedUsers),
      description: `${((blockedUsers / totalUsers) * 100).toFixed(1)}% of all users`,
      change: -2.5,
      changeLabel: "from last month",
      icon: <ShieldAlert size={18} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className={`${stat.iconBg} ${stat.iconColor} p-2 rounded-md`}>
                  {stat.icon}
                </div>
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  stat.change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;