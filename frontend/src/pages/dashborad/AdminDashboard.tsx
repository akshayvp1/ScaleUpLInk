import { Outlet } from "react-router-dom";
import AdminDashboardLayout from "../../components/layouts/AdminLayout";


const AdminDashboard = () => {
  return (
    <AdminDashboardLayout>
      <Outlet />
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
