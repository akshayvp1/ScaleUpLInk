// App.tsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import UserRoutes from "./routes/entrepreneurRoutes";
import InvestorRoutes from "./routes/investorRoutes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommonRoutes from "./routes/commonRoutes";
import DashboardRouter from "./routes/dashboardRoutes";
import AdminDashboardRouter from "./routes/adminDashboardRoutes";
import AdminRouter from "./routes/adminRoutes";
import { ThemeProvider } from "./components/theme-provider";
import { setupPushNotifications } from "./services/notification/pushClient";
import NotificationToastContainer from "./components/basics/NotificationToastContainer";
import NotificationSoundListener from "./components/basics/NotificationSoundListener";
import CallProvider from "./components/call/CallProvider";
import { RootState } from "./redux/app/store";

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      void setupPushNotifications();
    }
  }, [token]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              boxShadow: "0 8px 24px -12px rgb(0 0 0 / 0.25)",
            },
            success: {
              iconTheme: { primary: "var(--success)", secondary: "var(--card)" },
            },
            error: {
              iconTheme: { primary: "var(--destructive)", secondary: "var(--card)" },
            },
          }}
        />
        <NotificationToastContainer />
        <NotificationSoundListener />
        <CallProvider>
          <Routes>
            <Route path="/entrepreneur/*" element={<UserRoutes />} />
            <Route path="/investor/*" element={<InvestorRoutes />} />
            <Route path="/mainpage/*" element={<DashboardRouter />} />
            <Route path="/*" element={<CommonRoutes />} />
            <Route path="/dashboard/*" element={<AdminDashboardRouter />} />
            <Route path="/admin/*" element={<AdminRouter />} />
          </Routes>
        </CallProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;