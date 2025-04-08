import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/app/store";
import { Navigate, useLocation } from "react-router-dom";

interface AntiProtectedRouteProps {
  children?: React.ReactNode;
  redirectPath?: string;
}

const AntiProtectedRoute: React.FC<AntiProtectedRouteProps> = ({
  children,
  redirectPath = "/signin",
}) => {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  console.log(auth,"lppppppppp")

  const restrictedPaths = [
    "/signin",
    "/signup",
    "/investor/investor-register",
    "/forgot-password",
    "/forgot-password-otp",
    "/create-new-password",
  ];

  if (auth.isAuthenticated && restrictedPaths.includes(location.pathname)) {
    const defaultRedirect =
      auth.role === "admin"
        ? "/signin"
        : auth.role === "entrepreneur"
        ? "/signin"
        : "/";

    return <Navigate to={'/mainpage/dashboard'} />;
  }

  return <>{children}</>;
};

export default AntiProtectedRoute;