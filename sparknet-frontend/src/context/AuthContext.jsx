import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { connectSocket, disconnectSocket } from '../api/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      
      // Hydrate token if it came back from getMe (e.g. following OAuth cookie redirect)
      const token = data.accessToken || localStorage.getItem('accessToken');
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      setUser(data.user);
      if (token) connectSocket(token); // Connect socket on successful fetch
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      disconnectSocket();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
    return () => disconnectSocket(); // Cleanup on unmount
  }, [fetchMe]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      connectSocket(data.accessToken); // Connect socket on login
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    setUser(null);
    disconnectSocket(); // Disconnect socket on logout
  };

  const logoutAll = async () => {
    try { await authApi.logoutAll(); } catch {}
    localStorage.removeItem('accessToken');
    setUser(null);
    disconnectSocket();
  };

  const isAdmin = user?.role === 'admin';
  const isChild = user?.role === 'child';
  const isGuardian = user?.isGuardian === true;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isChild, isGuardian, isAuthenticated,
      login, logout, logoutAll, fetchMe, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};