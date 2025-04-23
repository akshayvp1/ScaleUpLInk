// import React, { useState, useEffect } from 'react';
// import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, Users, Calendar, FileText, 
//   Bell, LogOut, ChevronsLeft, ChevronsRight 
// } from 'lucide-react';
// import { Button } from '../../components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
// import { cn } from '../../lib/utils';
// import { useIsMobile } from '../../hooks/use-mobile';
// import { toast } from "react-hot-toast";
// import { store } from '../../redux/app/store';
// import adminAuthService from '../../services/admin/adminAuthService';

// type NavItem = {
//   icon: React.ElementType;
//   label: string;
//   path: string;
//   mobileVisible?: boolean;
//   onClick?: () => void;
// };

// interface AdminDashboardLayoutProps {
//   children?: React.ReactNode;
// }

// const user = store.getState().tempUser.tempUser;

// const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isCompact, setIsCompact] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const isMobile = useIsMobile();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const handleNavClick = (item: NavItem) => {
//     navigate(item.path);
//   };

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       await adminAuthService.logout();
//       navigate('/admin/signin');
//       toast.success("Successfully logged out!", { duration: 3000, position: "top-right" });
//     } catch (error) {
//       console.error('Logout failed:', error);
//       toast.error("Logout failed. Please try again.");
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   const navigationItems: NavItem[] = [
//     { icon: LayoutDashboard, label: 'Home', path: '/dashboard/admin-dashboard/home', mobileVisible: true },
//     { icon: Users, label: 'User Management', path: '/dashboard/admin-dashboard/users', mobileVisible: true },
//     { icon: Calendar, label: 'Event Management', path: '/dashboard/admin-dashboard/events', mobileVisible: true },
//     { icon: FileText, label: 'Post Management', path: '/dashboard/admin-dashboard/posts', mobileVisible: true },
//     { icon: Bell, label: 'Notifications', path: '/dashboard/admin-dashboard/notifications' },
//   ];

//   const mobileNavItems = navigationItems.filter(item => item.mobileVisible);

//   const SidebarContent = () => (
//     <>
//       {/* Header */}
//       <div className="flex justify-between items-center p-6 border-b border-slate-100 ">
//         <div 
//           className={cn(
//             "flex items-center transition-all duration-300 ease-in-out",
//             isCompact && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
//           )}
//         >
//           <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg mr-3 shadow-md">
//             ADM
//           </div>
//           <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//             Admin Portal
//           </h1>
//         </div>
        
//         {!isMobile && (
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setIsCompact(!isCompact)}
//             className="text-slate-600 hover:text-orange-500 hover:bg-slate-50 rounded-full transition-all duration-200"
//           >
//             {isCompact ? 
//               <ChevronsRight className="h-5 w-5 transition-transform duration-300 ease-in-out transform hover:scale-110" /> : 
//               <ChevronsLeft className="h-5 w-5 transition-transform duration-300 ease-in-out transform hover:scale-110" />
//             }
//           </Button>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="flex-grow py-6 overflow-y-auto scrollbar-none">
//         <div className="space-y-1.5 px-3">
//           {navigationItems.map((item, index) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <Link 
//                 to={item.path} 
//                 key={item.label}
//                 className="block"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleNavClick(item);
//                 }}
//                 style={{ 
//                   animationDelay: `${index * 50}ms`,
//                   opacity: mounted ? 1 : 0,
//                   transform: mounted ? 'translateY(0)' : 'translateY(10px)',
//                   transition: 'opacity 300ms ease, transform 300ms ease'
//                 }}
//               >
//                 <div 
//                   className={cn(
//                     "flex items-center p-3 rounded-xl transition-all duration-200 group",
//                     isActive 
//                       ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
//                       : "text-slate-600 hover:bg-slate-100",
//                     isCompact && !isMobile && "justify-center"
//                   )}
//                 >
//                   <item.icon className={cn(
//                     "h-5 w-5 transition-transform duration-200",
//                     isActive 
//                       ? "" 
//                       : "group-hover:text-orange-500 group-hover:scale-110",
//                     isCompact && !isMobile ? "mx-auto" : "mr-4"
//                   )} />
//                   <span 
//                     className={cn(
//                       "font-medium transition-all duration-300 whitespace-nowrap",
//                       isCompact && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
//                     )}
//                   >
//                     {item.label}
//                   </span>
                  
//                   {isActive && !isCompact && !isMobile && (
//                     <div className="ml-auto h-2 w-2 rounded-full bg-white" />
//                   )}
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </nav>

//       {/* User Profile and Logout */}
//       <div className={cn(
//         "p-4 mx-3 mb-4 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300",
//         isCompact && !isMobile ? "px-2" : ""
//       )}>
//         <div 
//           className={cn(
//             "flex items-center transition-all duration-300",
//             isCompact && !isMobile ? "justify-center" : "justify-start"
//           )}
//         >
//           <Avatar className={cn(
//             "border-2 border-white shadow-sm transition-transform duration-200 hover:scale-105",
//             isCompact && !isMobile ? "h-10 w-10" : "h-10 w-10 mr-3"
//           )}>
//             <AvatarImage src={user?.profileImage} alt="Admin Avatar" />
//             <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">AD</AvatarFallback>
//           </Avatar>
//           <div 
//             className={cn(
//               "transition-all duration-300 overflow-hidden",
//               isCompact && !isMobile ? "opacity-0 w-0" : "opacity-100"
//             )}
//           >
//             <p className="font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
//             <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
//           </div>
//         </div>
        
//         <Button 
//           variant="ghost" 
//           size={isCompact && !isMobile ? "icon" : "default"}
//           className={cn(
//             "w-full mt-3 text-slate-600 hover:text-orange-500 hover:bg-slate-100 flex items-center rounded-xl transition-all duration-200",
//             isCompact && !isMobile ? "p-2 h-10" : "justify-start"
//           )}
//           onClick={handleLogout}
//           disabled={isLoggingOut}
//         >
//           <LogOut className={cn(
//             "h-5 w-5 transition-transform duration-200 hover:scale-110",
//             isCompact && !isMobile ? "" : "mr-3"
//           )} />
//           <span 
//             className={cn(
//               "font-medium transition-all duration-300",
//               isCompact && !isMobile ? "hidden" : "block"
//             )}
//           >
//             {isLoggingOut ? 'Logging out...' : 'Logout'}
//           </span>
//         </Button>
//       </div>
//     </>
//   );

//   return (
//     <div className="flex h-screen overflow-hidden bg-slate-50">
//       {/* Desktop Sidebar */}
//       {!isMobile && (
//         <div 
//           className={cn(
//             "bg-white border-r border-slate-100 shadow-[0_0_15px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-300 ease-in-out z-20",
//             isCompact ? "w-20" : "w-80",
//             mounted && "animate-fade-in"
//           )}
//         >
//           <SidebarContent />
//         </div>
//       )}

//       {/* Main Content Area */}
//       <main 
//         className={cn(
//           "flex-grow overflow-y-auto transition-all duration-300 relative",
//           isMobile ? "pb-20 pt-16" : "p-6"
//         )}
//       >
//         <Outlet />
//       </main>

//       {/* Mobile Header */}
//       {isMobile && (
//         <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-40 px-4 py-3 shadow-sm ">
//           <div className="flex items-center justify-between">
//             <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//               Admin Portal
//             </h1>
//             <div className="flex items-center space-x-4">
//               <Bell className="h-6 w-6 text-slate-800" />
//               <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
//                 <AvatarImage src={user?.profileImage} alt="Admin Avatar" />
//                 <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">AD</AvatarFallback>
//               </Avatar>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-16 z-50 ">
//           <div className="grid grid-cols-4 h-full">
//             {mobileNavItems.map((item) => {
//               const isActive = location.pathname === item.path;
//               return (
//                 <button
//                   key={item.label}
//                   onClick={() => handleNavClick(item)}
//                   className={cn(
//                     "flex flex-col items-center justify-center transition-colors duration-200",
//                     isActive 
//                       ? "text-orange-500" 
//                       : "text-slate-400 hover:text-slate-600"
//                   )}
//                 >
//                   <item.icon className={cn(
//                     "h-6 w-6 mb-1",
//                     isActive && "text-orange-500"
//                   )} />
//                   <span className="text-xs font-medium">
//                     {item.label.split(' ')[0]}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboardLayout;




import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  Bell, LogOut, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';
import { toast } from "react-hot-toast";
import { store } from '../../redux/app/store';
import adminAuthService from '../../services/admin/adminAuthService';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  mobileVisible?: boolean;
  onClick?: () => void;
};

interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
}

const user = store.getState().tempUser.tempUser;

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCompact, setIsCompact] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isMobile = useIsMobile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavClick = (item: NavItem) => {
    navigate(item.path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminAuthService.logout();
      navigate('/admin/signin');
      toast.success("Successfully logged out!", { duration: 3000, position: "top-right" });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigationItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard/admin-dashboard/home', mobileVisible: true },
    { icon: Users, label: 'User Management', path: '/dashboard/admin-dashboard/users', mobileVisible: true },
    { icon: Calendar, label: 'Event Management', path: '/dashboard/admin-dashboard/events', mobileVisible: true },
    { icon: FileText, label: 'Post Management', path: '/dashboard/admin-dashboard/posts', mobileVisible: true },
    { icon: Bell, label: 'Notifications', path: '/dashboard/admin-dashboard/notifications' },
  ];

  const mobileNavItems = navigationItems.filter(item => item.mobileVisible);

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={cn(
        "flex justify-between items-center p-6 border-b",
        "bg-background border-border"
      )}>
        <div 
          className={cn(
            "flex items-center transition-all duration-300 ease-in-out",
            isCompact && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          <div className={cn(
            "bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg mr-3 shadow-md"
          )}>
            ADM
          </div>
          <h1 className={cn(
            "text-xl font-bold text-foreground"
          )}>
            Admin Portal
          </h1>
        </div>
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCompact(!isCompact)}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-all duration-200"
            )}
          >
            {isCompact ? 
              <ChevronsRight className="h-5 w-5 transition-transform duration-300 ease-in-out transform hover:scale-110" /> : 
              <ChevronsLeft className="h-5 w-5 transition-transform duration-300 ease-in-out transform hover:scale-110" />
            }
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-6 overflow-y-auto scrollbar-none">
        <div className="space-y-1.5 px-3">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                to={item.path} 
                key={item.label}
                className="block"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 300ms ease, transform 300ms ease'
                }}
              >
                <div 
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                      : "text-muted-foreground hover:bg-accent",
                    isCompact && !isMobile && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive 
                      ? "" 
                      : "group-hover:text-orange-500 group-hover:scale-110",
                    isCompact && !isMobile ? "mx-auto" : "mr-4"
                  )} />
                  <span 
                    className={cn(
                      "font-medium transition-all duration-300 whitespace-nowrap",
                      isCompact && !isMobile ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {isActive && !isCompact && !isMobile && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile and Logout */}
      <div className={cn(
        "p-4 mx-3 mb-4 rounded-xl border transition-all duration-300",
        "bg-background/50 border-border",
        isCompact && !isMobile ? "px-2" : ""
      )}>
        <div 
          className={cn(
            "flex items-center transition-all duration-300",
            isCompact && !isMobile ? "justify-center" : "justify-start"
          )}
        >
          <Avatar className={cn(
            "border-2 border-border shadow-sm transition-transform duration-200 hover:scale-105",
            isCompact && !isMobile ? "h-10 w-10" : "h-10 w-10 mr-3"
          )}>
            <AvatarImage src={user?.profileImage} alt="Admin Avatar" />
            <AvatarFallback className={cn(
              "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            )}>AD</AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              "transition-all duration-300 overflow-hidden",
              isCompact && !isMobile ? "opacity-0 w-0" : "opacity-100"
            )}
          >
            <p className={cn("font-semibold text-foreground")}>
              {user?.name || 'Admin User'}
            </p>
            <p className={cn("text-xs text-muted-foreground")}>
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size={isCompact && !isMobile ? "icon" : "default"}
          className={cn(
            "w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-accent flex items-center rounded-xl transition-all duration-200",
            isCompact && !isMobile ? "p-2 h-10" : "justify-start"
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className={cn(
            "h-5 w-5 transition-transform duration-200 hover:scale-110",
            isCompact && !isMobile ? "" : "mr-3"
          )} />
          <span 
            className={cn(
              "font-medium transition-all duration-300",
              isCompact && !isMobile ? "hidden" : "block"
            )}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </Button>
      </div>
    </>
  );

  return (
    <div 
      className={cn("flex h-screen overflow-hidden bg-background")}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className={cn(
            "bg-background border-r border-border shadow-[0_0_15px_rgba(0,0,0,0.05)] flex flex-col transition-all duration-300 ease-in-out z-20",
            isCompact ? "w-20" : "w-80",
            mounted && "animate-fade-in"
          )}
        >
          <SidebarContent />
        </div>
      )}

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-grow overflow-y-auto transition-all duration-300 relative",
          isMobile ? "pb-20 pt-16" : "p-6"
        )}
      >
        <Outlet />
      </main>

      {/* Mobile Header */}
      {isMobile && (
        <div className={cn(
          "fixed top-0 left-0 right-0 bg-background border-b border-border z-40 px-4 py-3 shadow-sm"
        )}>
          <div className="flex items-center justify-between">
            <h1 className={cn("text-xl font-bold text-foreground")}>
              Admin Portal
            </h1>
            <div className="flex items-center space-x-4">
              <Bell className={cn("h-6 w-6 text-foreground")} />
              <Avatar className="h-8 w-8 border-2 border-border shadow-sm">
                <AvatarImage src={user?.profileImage} alt="Admin Avatar" />
                <AvatarFallback className={cn(
                  "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                )}>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className={cn(
          "fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)] h-16 z-50"
        )}>
          <div className="grid grid-cols-4 h-full">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "flex flex-col items-center justify-center transition-colors duration-200",
                    isActive 
                      ? "text-orange-500" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-6 w-6 mb-1",
                    isActive && "text-orange-500"
                  )} />
                  <span className="text-xs font-medium">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardLayout;