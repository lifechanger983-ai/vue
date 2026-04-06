import { createContext, useContext, useState, useEffect } from 'react';

const ClientContext = createContext();

export const useClient = () => useContext(ClientContext);

export const ClientProvider = ({ children }) => {
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    sexe: 'M'
  });

  // Charge depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clientInfo');
    if (saved) {
      setClientInfo(JSON.parse(saved));
    }
  }, []);

  const updateClientInfo = (info) => {
    setClientInfo(info);
    localStorage.setItem('clientInfo', JSON.stringify(info));
  };

  return (
    <ClientContext.Provider value={{ clientInfo, updateClientInfo }}>
      {children}
    </ClientContext.Provider>
  );
};