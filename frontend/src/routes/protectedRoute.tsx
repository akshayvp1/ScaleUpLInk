import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState, store } from "../redux/app/store";
import sharedService from "../services/shared/sharedService";
import { signOut } from "../redux/features/auth/authSlice";

interface ProtectedRouteProps {
  allowedRoles: ("entrepreneur" | "investor" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const auth = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await sharedService.checkStatus();

        if (!response.success) {
          setIsActive(false);
          store.dispatch(signOut());
          navigate("/signin");
        }
      } catch (err) {
        console.error(err);
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isActive) {
    return <Navigate to="/signin" replace />;
  }

  if (
    !auth.isAuthenticated ||
    !auth.user ||
    !allowedRoles.includes(
      auth.user.role as "entrepreneur" | "investor" | "admin"
    )
  ) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;