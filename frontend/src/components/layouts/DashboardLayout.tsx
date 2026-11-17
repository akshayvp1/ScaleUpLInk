import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Rss,
  Calendar,
  MessageSquare,
  PlusCircle,
  Newspaper,
  Bell,
  Users,
  Briefcase,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { AppShell } from "./AppShell";
import type { AppNavItem } from "./AppSidebar";
import CreatePostModal from "../basics/createPostModal";
import NotificationBell from "../basics/NotificationBell";
import { ModeToggle } from "../mode-toggle";
import authService from "../../services/user/authService";
import { RootState } from "../../redux/app/store";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const user = useSelector(
    (state: RootState) => state.auth.user ?? state.tempUser.tempUser
  );
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      localStorage.clear();
      navigate("/signin");
      toast.success("Successfully signed out!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navigationItems: AppNavItem[] = [
    { icon: Home, label: "Home", path: "/home", mobileVisible: true },
    { icon: Briefcase, label: "Investors", path: "/investors" },
    {
      icon: PlusCircle,
      label: "Create",
      path: "/create",
      mobileVisible: true,
      onClick: () => setShowCreatePost(true),
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notification",
      mobileVisible: true,
    },
    { icon: Users, label: "Profile", path: "/profile", mobileVisible: true },
    { icon: Rss, label: "Feeds", path: "/feeds" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: MessageSquare, label: "Message", path: "/chat" },
    { icon: Newspaper, label: "News", path: "/news" },
  ];

  return (
    <AppShell
      brandShort="SUL"
      brandTitle="ScaleUpLink"
      navItems={navigationItems}
      user={user}
      onLogout={handleLogout}
      loggingOut={isLoggingOut}
      profilePath="/profile"
      topBarRight={
        <>
          <NotificationBell />
          <ModeToggle />
        </>
      }
    >
      {showCreatePost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <CreatePostModal onClose={() => setShowCreatePost(false)} />
        </div>
      )}
    </AppShell>
  );
};

export default DashboardLayout;
