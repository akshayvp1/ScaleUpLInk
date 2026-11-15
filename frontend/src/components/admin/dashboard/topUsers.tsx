import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Calendar, MoreHorizontal, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils'; // Adjust path based on your setup

// TypeScript interfaces
interface EventUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  eventsCount: number;
  attendeeCount: number;
  lastEventDate: string;
}

const TopEventUsers: React.FC = () => {
  // Sample data for top users who conducted events
  const topUsers: EventUser[] = [
    {
      id: "user-1",
      name: "Alex Johnson",
      avatar: "/api/placeholder/32/32",
      email: "alex.johnson@example.com",
      eventsCount: 28,
      attendeeCount: 1245,
      lastEventDate: "2 days ago"
    },
    {
      id: "user-2",
      name: "Sarah Williams",
      avatar: "/api/placeholder/32/32",
      email: "sarah.w@example.com",
      eventsCount: 24,
      attendeeCount: 986,
      lastEventDate: "5 days ago"
    },
    {
      id: "user-3",
      name: "Michael Chen",
      avatar: "/api/placeholder/32/32",
      email: "michael.c@example.com",
      eventsCount: 19,
      attendeeCount: 823,
      lastEventDate: "1 week ago"
    },
    {
      id: "user-4",
      name: "Priya Patel",
      avatar: "/api/placeholder/32/32",
      email: "priya.p@example.com",
      eventsCount: 16,
      attendeeCount: 756,
      lastEventDate: "3 days ago"
    },
    {
      id: "user-5",
      name: "David Rodriguez",
      avatar: "/api/placeholder/32/32",
      email: "david.r@example.com",
      eventsCount: 14,
      attendeeCount: 642,
      lastEventDate: "2 weeks ago"
    }
  ];

  return (
    <Card className="border-border/70 bg-card shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Top event conductors
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most active organizers this month
            </p>
          </div>
        </div>
        <button className="flex items-center text-xs font-semibold text-primary transition-colors hover:text-primary/80">
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="divide-y divide-border/60">
          {topUsers.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full bg-muted object-cover ring-1 ring-border/60"
                  />
                  {index < 3 && (
                    <div className={cn(
                      "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm",
                      index === 0
                        ? "bg-warning"
                        : index === 1
                          ? "bg-muted-foreground/60"
                          : "bg-warning/80"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{user.eventsCount}</p>
                  <p className="text-[11px] text-muted-foreground">Events</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-foreground">{user.attendeeCount}</p>
                  <p className="text-[11px] text-muted-foreground">Attendees</p>
                </div>
                <div className="hidden text-right md:block">
                  <p className="text-xs text-muted-foreground">{user.lastEventDate}</p>
                </div>
                <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopEventUsers;