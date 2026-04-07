import { useEffect, useState } from 'react';
import { useAdminSocket } from '../../hooks/useAdminSocket';
import { ShieldAlert, Zap, Database, Activity, Ban, Loader2 } from 'lucide-react';
import api from '../../api/axiosConfig';

const SecurityDashboard = () => {
  const { securityLogs: socketLogs } = useAdminSocket();
  const [securityLogs, setSecurityLogs] = useState([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    ddos: 0,
    sqli: 0,
    xss: 0,
    blockedIPs: new Set()
  });
  const [registerLocked, setRegisterLocked] = useState(false);
  const [superAdminCount, setSuperAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);

  const fetchSecurityStatus = async () => {
    try {
      const response = await api.get('/admin/security/status');
      setRegisterLocked(response.data.registerLocked);
      setSuperAdminCount(response.data.superAdminCount);
    } catch (error) {
      console.error('Erreur status register:', error);
    }
  };

  const toggleRegisterLock = async () => {
    setRegisterLoading(true);
    try {
      const response = await api.post('/admin/security/toggle-register-lock');
      setRegisterLocked(response.data.registerLocked);
      alert(response.data.message);
    } catch (error) {
      alert('Erreur: ' + (error.response?.data?.error || error.message));
    } finally {
      setRegisterLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/security/logs');
      setSecurityLogs(data.logs);
      setStats({
        totalAttacks: data.stats.totalAttacks,
        ddos: data.stats.ddos,
        sqli: data.stats.sqli,
        xss: data.stats.xss,
        blockedIPs: data.stats.blockedIPs
      });
    } catch (error) {
      console.error('Erreur logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
    fetchLogs();
    const interval = setInterval(() => {
      fetchSecurityStatus();
      fetchLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (socketLogs?.length) {
      setSecurityLogs(prev => [...new Set([...prev, ...socketLogs])]);
    }
  }, [socketLogs]);

  useEffect(() => {
    if (securityLogs?.length) {
      const total = securityLogs.length;
      const ddos = securityLogs.filter(log => log.typeAttaque === 'DDOS').length;
      const sqli = securityLogs.filter(log => log.typeAttaque === 'SQLi').length;
      const xss = securityLogs.filter(log => log.typeAttaque === 'XSS').length;
      const ips = new Set(securityLogs.map(log => log.ip));
      setStats({ totalAttacks: total, ddos, sqli, xss, blockedIPs: ips });
    }
  }, [securityLogs]);

  const banIP = async (ip) => {
    try {
      await api.post('/admin/security/ban-ip', { ip });
      alert(`IP ${ip} bannie`);
      fetchLogs();
    } catch (error) {
      alert('Erreur ban IP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header RESPONSIVE */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-red-400 via-pink-500 to-red-600 bg-clip-text text-transparent mb-1 sm:mb-2">
          Sécurité Watchdog
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">Monitoring temps réel des menaces et contrôle d'accès</p>
      </div>

      {/* REGISTER LOCK ULTRA RESPONSIVE */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 rounded-3xl">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center gap-2">
          🔒 Contrôle Register
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start lg:items-center">
          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border-4 transition-all ${
            registerLocked 
              ? 'bg-red-500/20 border-red-500/50 shadow-red-500/25' 
              : 'bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/25'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">/admin/register</h3>
              <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-lg font-black ${
                registerLocked 
                  ? 'bg-red-600 text-red-100 shadow-lg shadow-red-500/50' 
                  : 'bg-emerald-600 text-emerald-100 shadow-lg shadow-emerald-500/50'
              }`}>
                {registerLocked ? '🔒 VERROUILLÉ' : '✅ OUVERT'}
              </span>
            </div>
            <p className={`text-base sm:text-lg mb-4 sm:mb-6 ${registerLocked ? 'text-red-200' : 'text-emerald-200'}`}>
              {registerLocked 
                ? 'Aucun nouvel admin ne peut être créé.' 
                : `Nouveau Super Admin possible (${superAdminCount} existant${superAdminCount !== 1 ? 's' : ''}).`
              }
            </p>
            <div className="text-xs sm:text-sm text-slate-400 space-y-1">
              <p>• <code className="font-mono bg-slate-700 px-2 py-1 rounded">registerLocked = {registerLocked ? 'true' : 'false'}</code></p>
              <p>• Super Admins: <strong className="text-white">{superAdminCount}</strong></p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-col">
            <button
              onClick={toggleRegisterLock}
              disabled={registerLoading}
              className={`flex-1 py-3 sm:py-4 px-6 lg:px-8 rounded-2xl font-black text-sm sm:text-base lg:text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                registerLocked
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-emerald-900 shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-red-900 shadow-red-500/50'
              } ${registerLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {registerLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin" />
                  <span className="text-xs sm:text-sm lg:text-base">Mise à jour...</span>
                </div>
              ) : registerLocked ? '🔓 DÉVERROUILLER' : '🔒 VERROUILLER'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-sm hover:scale-102 lg:hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base font-medium">Total Attaques</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.totalAttacks.toLocaleString()}</p>
            </div>
            <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-sm hover:scale-102 lg:hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base font-medium">DDOS</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.ddos}</p>
            </div>
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-yellow-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-sm hover:scale-102 lg:hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base font-medium">SQLi</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.sqli}</p>
            </div>
            <Database className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl backdrop-blur-sm hover:scale-102 lg:hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base font-medium">XSS</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.xss}</p>
            </div>
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Logs Table ULTRA RESPONSIVE */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
            <span>Logs Sécurité (derniers)</span>
          </h2>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center"
          >
            Actualiser
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] sm:min-w-[800px]">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-slate-300 font-semibold text-xs sm:text-sm">IP</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-slate-300 font-semibold text-xs sm:text-sm hidden sm:table-cell">Type</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-slate-300 font-semibold text-xs sm:text-sm hidden md:table-cell">Date</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-slate-300 font-semibold text-xs sm:text-sm hidden lg:table-cell">User-Agent</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-slate-300 font-semibold text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {securityLogs.slice(0, 10).map((log, index) => (
                <tr key={index} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 sm:px-4 lg:px-6 py-3 font-mono text-xs sm:text-sm bg-red-500/10">
                    <span className="truncate block sm:inline">{log.ip}</span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 hidden sm:table-cell">
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full">
                      {log.typeAttaque}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 text-xs sm:text-sm text-slate-400 hidden md:table-cell">
                    {new Date(log.createdAt).toLocaleString('fr-FR', { 
                      year: 'numeric', month: 'short', day: 'numeric', 
                      hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 text-xs sm:text-sm text-slate-400 hidden lg:table-cell truncate max-w-xs">
                    {log.userAgent?.substring(0, 40)}...
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-3 text-right">
                    <button
                      onClick={() => banIP(log.ip)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Ban IP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;