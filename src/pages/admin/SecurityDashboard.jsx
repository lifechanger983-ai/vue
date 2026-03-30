import { useEffect, useState } from 'react';
import { useAdminSocket } from '../../hooks/useAdminSocket';
import { ShieldAlert, Zap, Database, Activity, Ban, BanIcon } from 'lucide-react';
import api from '../../api/axiosConfig';

const SecurityDashboard = () => {
  const { securityLogs } = useAdminSocket();
  const [stats, setStats] = useState({
    totalAttacks: 0,
    ddos: 0,
    sqli: 0,
    xss: 0,
    blockedIPs: new Set()
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchLogs();

    const interval = setInterval(fetchLogs, 30000); // Refresh 30s
    return () => clearInterval(interval);
  }, []);

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
    } catch (error) {
      alert('Erreur ban IP');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Sécurité Watchdog
        </h1>
        <p className="text-slate-400">Monitoring temps réel des menaces et performances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 p-6 rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Attaques</p>
              <p className="text-3xl font-bold text-white">{stats.totalAttacks}</p>
            </div>
            <ShieldAlert className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6 rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">DDOS</p>
              <p className="text-3xl font-bold text-white">{stats.ddos}</p>
            </div>
            <Zap className="w-12 h-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-6 rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">SQL Injection</p>
              <p className="text-3xl font-bold text-white">{stats.sqli}</p>
            </div>
            <Database className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 p-6 rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">IPs Bloquées</p>
              <p className="text-3xl font-bold text-white">{stats.blockedIPs}</p>
            </div>
            <Ban className="w-12 h-12 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-8 h-8" />
            <span>Logs Sécurité (50 derniers)</span>
          </h2>
          <button
            onClick={() => api.get('/admin/security/logs').then(data => setSecurityLogs(data.data.logs))}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Actualiser
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">IP</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">User-Agent</th>
                <th className="px-6 py-4 text-left text-slate-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {securityLogs.slice(0, 10).map((log, index) => (
                <tr key={index} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm bg-red-500/10">{log.ip}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full">
                      {log.typeAttaque}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs">
                    {log.userAgent?.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => banIP(log.ip)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
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