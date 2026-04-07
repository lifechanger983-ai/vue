import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import DashboardLayout from './pages/admin/DashboardLayout';
import Login from './pages/admin/Login';
import Register from './pages/admin/register';
import SecurityDashboard from './pages/admin/SecurityDashboard';
import ProduitLongrich from './components/admin/ProduitLongrich';  
import ProprietaireManagement from './components/admin/ProprietaireManagement';
import BoutiquesManagement from './components/admin/BoutiquesManagement';
import ServicesManagement from './components/admin/ServicesManagement';
import PackSanteManagement from './components/admin/PackSanteManagement';

// ✅ VAGUE 5 - CLIENTS
import BoutiqueLayout from './pages/clients/BoutiqueLayout';
import Accueil from './pages/clients/Accueil';
import ProduitsLongrichClient from './pages/clients/ProduitsLongrichClient';
import BoutiqueServices from './pages/clients/BoutiqueServices';
import DebutPage from './pages/clients/DebutPage';  // ✅ NOUVEAU IMPORT

function AppContent() {
  const location = useLocation();

  return (
    <AdminAuthProvider>
      <Routes>
        {/* ✅ PAGE D'ACCUEIL PRINCIPALE */}
        <Route path="/" element={<DebutPage />} />
        <Route path="/debut" element={<DebutPage />} />

        {/* ✅ ROUTES CLIENTS BOUTIQUES */}
        <Route path="/boutique/:urlBoutique" element={<BoutiqueLayout />}>
          <Route index element={<Accueil />} />
          <Route path="services" element={<BoutiqueServices />} />
          <Route path="produits-longrich" element={<ProduitsLongrichClient />} />
          <Route path="produits" element={<ProduitsLongrichClient />} />
          <Route path="packs-sante" element={<div>Packs Santé bientôt</div>} />
          <Route path="autres-produits" element={<div>Autres Produits bientôt</div>} />
        </Route>

        {/* ✅ ROUTES ADMIN (protégées) */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/security" replace />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="produits" element={<ProduitLongrich />} />
          <Route path="proprietaires" element={<ProprietaireManagement />} />
          <Route path="boutiques" element={<BoutiquesManagement />} />
          <Route path="services" element={<ServicesManagement />} />
          <Route path="packsante" element={<PackSanteManagement />} />
          <Route path="dashboard" element={<div>Dashboard bientôt</div>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h1 className="text-6xl font-black text-slate-600 mb-4">404</h1>
              <p className="text-xl text-slate-500 mb-8">Page introuvable</p>
              <div className="space-y-2">
                <a href="/" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl text-white font-semibold transition-all">
                  ← Page d'accueil
                </a>
                <a href="/admin/login" className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-xl text-white font-semibold transition-all">
                  Admin →
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </AdminAuthProvider>
  );
}

export default AppContent;
