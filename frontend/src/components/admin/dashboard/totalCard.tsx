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
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Premium Users",
      value: formatNumber(premiumUsers),
      description: `${Math.round((premiumUsers / totalUsers) * 100)}% conversion rate`,
      change: 12.5,
      changeLabel: "from last month",
      icon: <CreditCard size={18} />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: `${formatCurrency(Math.round(totalRevenue / premiumUsers))} per premium user`,
      change: 15.3,
      changeLabel: "from last month",
      icon: <BadgeDollarSign size={18} />,
      iconBg: "bg-success/10",
      iconColor: "text-success"
    },
    {
      label: "Events",
      value: formatNumber(eventsCount),
      description: "Total events conducted",
      change: 6.8,
      changeLabel: "from last month",
      icon: <Calendar size={18} />,
      iconBg: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      label: "Total Posts",
      value: formatNumber(postsCount),
      description: "User-generated content",
      change: 9.2,
      changeLabel: "from last month",
      icon: <FileText size={18} />,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      label: "Blocked Users",
      value: formatNumber(blockedUsers),
      description: `${((blockedUsers / totalUsers) * 100).toFixed(1)}% of all users`,
      change: -2.5,
      changeLabel: "from last month",
      icon: <ShieldAlert size={18} />,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Platform metrics
        </h2>
        <span className="text-xs text-muted-foreground">Last updated just now</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/70 bg-card shadow-soft hover-lift">
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className={`${stat.iconBg} ${stat.iconColor} flex h-10 w-10 items-center justify-center rounded-xl`}>
                  {stat.icon}
                </div>
                <div className={cn(
                  "flex items-center rounded-full px-2 py-1 text-[11px] font-semibold",
                  stat.change >= 0
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="line-clamp-2 pt-1 text-xs leading-relaxed text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;