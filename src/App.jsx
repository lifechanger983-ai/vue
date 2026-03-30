import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import DashboardLayout from './pages/admin/DashboardLayout';
import Login from './pages/admin/Login';
import Register from './pages/admin/register';
import SecurityDashboard from './pages/admin/SecurityDashboard';
import ProduitLongrich from './components/admin/ProduitLongrich';  
import ProprietaireManagement from './components/admin/ProprietaireManagement';
import BoutiquesManagement from './components/admin/BoutiquesManagement';
// ✅ VAGUE 4 - NOUVEAU
import ServicesManagement from './components/admin/ServicesManagement';
import PackSanteManagement from './components/admin/PackSanteManagement';

// ✅ VAGUE 5 - ROUTES CLIENTS PUBLIQUES
import BoutiqueLayout from './pages/clients/BoutiqueLayout';
import ProduitsLongrich from './pages/clients/ProduitsLongrich';

function AppContent() {
  const location = useLocation();

  return (
    <AdminAuthProvider>
      <Routes>
        {/* ✅ ROUTES PUBLIQUES CLIENTS - VAGUE 5 (PREMIÈRES !) */}
        <Route path="/boutique/:urlBoutique" element={<BoutiqueLayout />}>
          <Route index element={<ProduitsLongrich />} />
          <Route path="produits-longrich" element={<ProduitsLongrich />} />
          <Route path="produits" element={<ProduitsLongrich />} />
          {/* Routes TODO - À créer plus tard */}
          <Route path="packs-sante" element={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-8">🛒</div>
                <h1 className="text-4xl font-bold text-white mb-4">Packs Santé</h1>
                <p className="text-slate-400 mb-8">Bientôt disponible - Vague 6</p>
                <a href="produits" className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-medium transition-colors">
                  <span>Voir Produits</span>
                </a>
              </div>
            </div>
          } />
          <Route path="autres-produits" element={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-8">📦</div>
                <h1 className="text-4xl font-bold text-white mb-4">Autres Produits</h1>
                <p className="text-slate-400 mb-8">Bientôt disponible - Vague 6</p>
                <a href="produits" className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-medium transition-colors">
                  <span>Voir Produits</span>
                </a>
              </div>
            </div>
          } />
        </Route>

        {/* Routes publiques admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        
        {/* Routes protégées Admin */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/security" replace />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="produits" element={<ProduitLongrich />} />
          <Route path="proprietaires" element={<ProprietaireManagement />} />
          <Route path="boutiques" element={<BoutiquesManagement />} />
          {/* ✅ VAGUE 4 - NOUVEAU */}
          <Route path="services" element={<ServicesManagement />} />
          <Route path="packsante" element={<PackSanteManagement />} />
          <Route path="dashboard" element={
            <div className="p-8 text-center">
              <div className="max-w-md mx-auto bg-slate-800/50 p-12 rounded-3xl backdrop-blur-xl border border-slate-700">
                <div className="text-6xl text-purple-400 mb-6 mx-auto w-24 h-24 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  📊
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Dashboard Général</h1>
                <p className="text-slate-400 mb-8">Bientôt disponible - Vague 8</p>
              </div>
            </div>
          } />
        </Route>

        {/* Redirection racine → Admin Login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-8">🚫</div>
              <h1 className="text-4xl font-bold text-white mb-4">Page non trouvée</h1>
              <p className="text-slate-400 mb-8">La page que vous cherchez n'existe pas.</p>
              <a href="/admin/login" className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-colors">
                <span>Retour Login</span>
              </a>
            </div>
          </div>
        } />
      </Routes>
    </AdminAuthProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
