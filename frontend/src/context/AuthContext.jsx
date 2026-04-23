import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('flyeasy_token');
    const storedUser = localStorage.getItem('flyeasy_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('flyeasy_token');
        localStorage.removeItem('flyeasy_user');
      }
    }
  }, []);

  const login = (newToken, userObj) => {
    setToken(newToken);
    setUser(userObj);
    localStorage.setItem('flyeasy_token', newToken);
    localStorage.setItem('flyeasy_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('flyeasy_token');
    localStorage.removeItem('flyeasy_user');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
