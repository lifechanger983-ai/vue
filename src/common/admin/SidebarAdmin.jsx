import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, Package, Users, Store, Activity, BarChart3, Truck, LayoutDashboard,
  List,  // ✅ Services
  Heart   // ✅ Santé
} from 'lucide-react';

const SidebarAdmin = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, comingSoon: true },
    { path: '/admin/security', label: 'Sécurité', icon: Shield, active: true },
    { 
      path: '/admin/produits', 
      label: 'Produits Longrich', 
      icon: Package,
      comingSoon: false
    },
    { 
      path: '/admin/proprietaires', 
      label: 'Propriétaires', 
      icon: Users,
      comingSoon: false
    },
    { 
      path: '/admin/boutiques', 
      label: 'Boutiques', 
      icon: Store,
      comingSoon: false
    },
    // ✅ VAGUE 4 - NOUVEAU
    { 
      path: '/admin/services', 
      label: 'Services', 
      icon: List,
      comingSoon: false
    },
    { 
      path: '/admin/packsante', 
      label: 'Packs Santé', 
      icon: Heart,
      comingSoon: false
    },
    { path: '/admin/stats', label: 'Statistiques', icon: BarChart3, comingSoon: true },
    { path: '/admin/livraisons', label: 'Livraisons', icon: Truck, comingSoon: true }
  ];

  // ... reste identique
  return (
    <aside className={`bg-slate-900/95 backdrop-blur-md border-r border-slate-800/50 transition-all duration-300 h-screen overflow-y-auto ${isExpanded ? 'w-64' : 'w-20'}`}>
      <div className="p-6 border-b border-slate-800/50">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors w-full flex justify-center md:justify-start"
        >
          <Shield className={`w-6 h-6 ${isExpanded ? 'text-purple-400' : 'text-white'}`} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border-slate-700 border border-transparent'
              }`}
            >
              <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
              {isExpanded && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.comingSoon && (
                    <span className="ml-auto px-2 py-1 bg-slate-700/50 text-xs rounded-full text-slate-400 font-mono">
                      Bientôt
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;