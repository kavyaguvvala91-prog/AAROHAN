import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'college_discovery_auth';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : { token: '', user: null };
  } catch (error) {
    return { token: '', user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  useEffect(() => {
    if (authState?.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [authState]);

  const login = ({ token, user }) => {
    setAuthState({ token, user });
  };

  const logout = () => {
    setAuthState({ token: '', user: null });
  };

  const value = useMemo(
    () => ({
      token: authState?.token || '',
      user: authState?.user || null,
      isAuthenticated: Boolean(authState?.token),
      login,
      logout,
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};

export const getStoredToken = () => {
  const authData = readStoredAuth();
  return authData?.token || '';
};
