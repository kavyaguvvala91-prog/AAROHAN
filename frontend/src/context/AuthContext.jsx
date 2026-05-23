import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'college_discovery_auth';
const AUTH_NOTICE_STORAGE_KEY = 'college_discovery_auth_notice';
export const AUTH_SESSION_EXPIRED_EVENT = 'college-auth-session-expired';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : { token: '', user: null };
  } catch (error) {
    return { token: '', user: null };
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // Ignore storage access failures and fall back to in-memory logout.
  }
};

const writeAuthNotice = (message) => {
  try {
    sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, message);
  } catch (error) {
    // Ignore storage access failures and proceed without a persisted notice.
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => readStoredAuth());

  useEffect(() => {
    if (authState?.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      return;
    }

    clearStoredAuth();
  }, [authState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSessionExpired = () => {
      setAuthState({ token: '', user: null });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

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

export const expireAuthSession = (
  message = 'Your session expired. Please log in again.'
) => {
  clearStoredAuth();
  writeAuthNotice(message);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));

    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }
};

export const readAuthNotice = () => {
  try {
    const message = sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY) || '';

    if (message) {
      sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
    }

    return message;
  } catch (error) {
    return '';
  }
};
