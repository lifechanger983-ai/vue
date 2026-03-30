import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useAdminSocket = () => {
  const [socket, setSocket] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [securityStats, setSecurityStats] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const newSocket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/admin-watchdog`, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('🛡️ Connecté admin-watchdog');
    });

    newSocket.on('new_security_log', (log) => {
      setSecurityLogs(prev => [log, ...prev.slice(0, 49)]);
    });

    newSocket.on('security_stats', (stats) => {
      setSecurityStats(stats);
    });

    newSocket.on('perf_metrics', (metrics) => {
      console.log('📊 Perf:', metrics);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Déconnecté admin-watchdog');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { socket, securityLogs, securityStats };
};