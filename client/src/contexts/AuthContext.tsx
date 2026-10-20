import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api, setCsrfToken } from '../services/api';
import type { AdminUser, AuthSession } from '../types';

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  admin: AdminUser | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    admin: null,
  });

  useEffect(() => {
    let active = true;
    api
      .get<AuthSession>('/api/auth/session')
      .then((session) => {
        if (!active) return;
        if (session.authenticated && session.admin) {
          setCsrfToken(session.csrfToken ?? null);
          setState({ loading: false, authenticated: true, admin: session.admin });
        } else {
          setCsrfToken(null);
          setState({ loading: false, authenticated: false, admin: null });
        }
      })
      .catch(() => {
        if (active) setState({ loading: false, authenticated: false, admin: null });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setCsrfToken(null);
      setState({ loading: false, authenticated: false, admin: null });
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.post<AuthSession>('/api/auth/login', { email, password });
    if (!session.authenticated || !session.admin) {
      throw new Error('Sign in failed');
    }
    setCsrfToken(session.csrfToken ?? null);
    setState({ loading: false, authenticated: true, admin: session.admin });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setCsrfToken(null);
      setState({ loading: false, authenticated: false, admin: null });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const ProtectedRoute = () => {
  const { loading, authenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
          Verifying your session…
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
