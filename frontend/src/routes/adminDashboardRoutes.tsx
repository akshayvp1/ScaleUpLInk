import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHome from "../pages/admin/home";
import UserMangement from "../pages/admin/userMangement";
import EventManagement from "../pages/admin/eventManagement";
import AdminLayout from "../components/layouts/AdminLayout"; 
import PostManagement from "../pages/admin/postManagement";
import ProtectedRoute from "./protectedRoute";

const AdminDashboardRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminHome />} /> {/* Default page */}
          <Route path="home" element={<AdminHome />} />
          <Route path="users" element={<UserMangement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="posts" element={<PostManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminDashboardRouter;
