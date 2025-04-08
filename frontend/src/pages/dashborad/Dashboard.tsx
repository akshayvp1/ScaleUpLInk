import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};

export default Dashboard;