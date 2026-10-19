import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken } from './api';
import { User } from './types';
import { reset, setExpenses, store } from './store';
type Auth = { user: User | null; loading: boolean; signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>; signOut(): void };
const AuthContext = createContext<Auth | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  useEffect(() => {
    let active = true;
    if (getToken()) api.me().then(result => { if (active) setUser(result); })
      .catch(() => { if (active) setToken(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const clear = () => { store.dispatch(reset()); store.dispatch(setExpenses([])); localStorage.removeItem('retain_user'); };
  const done = (result: { token: string; user: User }) => { clear(); setToken(result.token); setUser(result.user); };
  return <AuthContext.Provider value={{ user, loading,
    signIn: async (email, password) => done(await api.signin({ email, password })),
    signUp: async (name, email, password) => done(await api.signup({ name, email, password })),
    signOut: () => { clear(); setToken(null); setUser(null); }
  }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};
