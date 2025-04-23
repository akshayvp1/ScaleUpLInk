import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Award, Calendar, MoreHorizontal, ArrowRight } from 'lucide-react';
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
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
          <CardTitle className="text-lg font-medium text-foreground">Top Event Conductors</CardTitle>
        </div>
        <div className="flex items-center">
          <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center">
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {topUsers.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full bg-muted"
                  />
                  {index < 3 && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                      index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user.eventsCount}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.attendeeCount}</p>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-muted-foreground">{user.lastEventDate}</p>
                </div>
                <button className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
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