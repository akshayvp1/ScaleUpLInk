import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/app/store';
import sharedService from '../services/shared/sharedService';

interface ProtectedRouteProps {
  allowedRoles: ("entrepreneur" | "investor" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await sharedService.checkStatus();
        if (!response.success) {
          setIsActive(false);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isActive) {
    return <Navigate to="/signin" replace />;
  }

  if (!auth.isAuthenticated || !auth.user || !allowedRoles.includes(auth.user.role as "entrepreneur" | "investor" | "admin")) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
