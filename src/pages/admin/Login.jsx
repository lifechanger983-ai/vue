import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Shield, LogIn, AlertTriangle } from 'lucide-react';
import api from '../../api/axiosConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerAvailable, setRegisterAvailable] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);  // ✅ Loading séparé
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  // ✅ CACHE LOCAL + ONCE ONLY
  const checkRegisterAccess = useCallback(async () => {
    // Check cache d'abord
    const cached = localStorage.getItem('registerCheck');
    const cacheTime = localStorage.getItem('registerCheckTime');
    const now = Date.now();
    
    if (cached && cacheTime && (now - parseInt(cacheTime)) < 60000) { // 1min cache
      setRegisterAvailable(JSON.parse(cached).access);
      setCheckLoading(false);
      return;
    }

    try {
      const response = await api.get('/admin/register-check');
      const result = { access: response.data.access };
      
      // Cache 1min
      localStorage.setItem('registerCheck', JSON.stringify(result));
      localStorage.setItem('registerCheckTime', now.toString());
      
      setRegisterAvailable(result.access);
    } catch (error) {
      console.log('Register bloqué (cache):', error.response?.data?.error);
      setRegisterAvailable(false);
    } finally {
      setCheckLoading(false);
    }
  }, []);

  // ✅ useEffect ONCE + CLEAN
  useEffect(() => {
    checkRegisterAccess();
  }, [checkRegisterAccess]); // ✅ Stable callback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Super Admin
          </h1>
          <p className="text-slate-400">Accès sécurisé MEGA ECOMMERCE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="super@admin.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* ✅ SECTION REGISTER SANS CHECK EN CONTINU */}
        <div className="mt-8 text-center space-y-3">
          {checkLoading ? (
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
              <div className="animate-spin w-4 h-4 border-2 border-slate-400/20 border-t-slate-400 rounded-full" />
              <span>Vérification...</span>
            </div>
          ) : registerAvailable ? (
            <Link 
              to="/admin/register" 
              className="block w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition-all mx-auto"
            >
              🎉 Créer le 1er Super Admin
            </Link>
          ) : (
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 p-6 rounded-3xl backdrop-blur-xl shadow-2xl animate-pulse">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400 drop-shadow-2xl" />
              <h3 className="text-xl font-bold text-red-300 mb-2">🚨 ACCÈS BLOQUÉ</h3>
              <p className="text-red-200 mb-4 text-sm">Super Admin existe déjà !</p>
              <p className="text-sm text-red-400 font-mono bg-red-900/50 px-3 py-1 rounded-xl inline-block">
                Contact: support@mega-ecom.cm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
