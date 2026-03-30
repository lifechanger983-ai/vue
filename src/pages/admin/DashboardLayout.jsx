import { Outlet } from 'react-router-dom';
import HeaderAdmin from '../../common/admin/HeaderAdmin';
import SidebarAdmin from '../../common/admin/SidebarAdmin';
import ProtectedRoute from '../../components/admin/ProtectedRoute';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const DashboardLayout = () => {
  const { logout } = useAdminAuth();
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-white">
        <HeaderAdmin onLogout={logout} />
        <div className="flex">
          <SidebarAdmin />
          <main className="flex-1 p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;