import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/app/store";
import { Navigate, useLocation } from "react-router-dom";

interface AntiProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const AntiProtectedRoute: React.FC<AntiProtectedRouteProps> = ({
  children,
  redirectPath = "/mainpage/dashboard",
}) => {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const restrictedPaths = [
    "/",
    "/signin",
    "/signup",
    "/otp",
    // "/forgot-password",
    // "/forgot-password-otp",
    // "/create-new-password",
    "/role",
  ];

  const currentPath = location.pathname.toLowerCase();

  if (auth.isAuthenticated && restrictedPaths.includes(currentPath)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default AntiProtectedRoute;

