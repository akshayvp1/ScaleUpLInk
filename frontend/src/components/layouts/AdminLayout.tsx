import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Bell,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { AppShell } from "./AppShell";
import type { AppNavItem } from "./AppSidebar";
import { ModeToggle } from "../mode-toggle";
import { RootState } from "../../redux/app/store";
import adminAuthService from "../../services/admin/adminAuthService";

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const user = useSelector(
    (state: RootState) => state.auth.user ?? state.tempUser.tempUser
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminAuthService.logout();
      navigate("/admin/signin");
      toast.success("Successfully logged out!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems: AppNavItem[] = [
    {
      icon: LayoutDashboard,
      label: "Home",
      path: "/dashboard/admin-dashboard/home",
      mobileVisible: true,
    },
    {
      icon: Users,
      label: "Users",
      path: "/dashboard/admin-dashboard/users",
      mobileVisible: true,
    },
    {
      icon: Calendar,
      label: "Events",
      path: "/dashboard/admin-dashboard/events",
      mobileVisible: true,
    },
    {
      icon: FileText,
      label: "Posts",
      path: "/dashboard/admin-dashboard/posts",
      mobileVisible: true,
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/dashboard/admin-dashboard/notifications",
    },
  ];

  return (
    <AppShell
      brandShort="ADM"
      brandTitle="Admin Portal"
      navItems={navigationItems}
      user={user}
      onLogout={handleLogout}
      loggingOut={isLoggingOut}
      topBarRight={<ModeToggle />}
    />
  );
};

export default AdminDashboardLayout;
