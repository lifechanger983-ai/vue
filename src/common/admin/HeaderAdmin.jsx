import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const HeaderAdmin = ({ onLogout, toggleSidebar }) => {
  const { admin } = useAdminAuth();

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50 sticky top-0 z-50 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-slate-800 rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MEGA ECOMMERCE
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-slate-800 rounded-xl relative">
            <Bell className="w-6 h-6 text-slate-400" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center text-white font-bold">3</span>
          </button>

          <div className="flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-xl cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              {admin?.nom?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-white">{admin?.nom}</p>
              <p className="text-sm text-slate-400">{admin?.email}</p>
            </div>
            <User className="w-5 h-5 text-slate-400 hidden md:block" />
          </div>

          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-600/20 hover:text-red-400 rounded-xl transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;