import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPatch } from '../lib/apiClient';
import { setCurrentUser } from '../lib/authState';
import { syncFromServer } from '../lib/csPlatform';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/auth/me')
      .then((me) => {
        setUser(me);
        setCurrentUser(me);
        return syncFromServer();
      })
      .catch(() => {
        setUser(null);
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const me = await apiPost('/auth/login', { email, password });
    setUser(me);
    setCurrentUser(me);
    await syncFromServer().catch((err) =>
      console.warn('Progress sync after login failed:', err.message)
    );
    return me;
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    const me = await apiPost('/auth/register', { email, password, displayName });
    setUser(me);
    setCurrentUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await apiPost('/auth/logout', {}).catch(() => {});
    setUser(null);
    setCurrentUser(null);
  }, []);

  // Returns the server's message. The response is intentionally identical
  // whether or not the email is registered (see server/src/routes/auth.js)
  // so this can't be used to enumerate accounts.
  const requestPasswordReset = useCallback(async (email) => {
    const res = await apiPost('/auth/forgot-password', { email });
    return res.message;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    await apiPost('/auth/reset-password', { token, password });
  }, []);

  const updateProfile = useCallback(async (displayName) => {
    const me = await apiPatch('/auth/me', { displayName });
    setUser(me);
    setCurrentUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
