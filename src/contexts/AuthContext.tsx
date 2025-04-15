
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Volunteer } from '@/types';
import { Session, User } from '@supabase/supabase-js';
import { fetchVolunteerProfile, signIn, signOut, signUp } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  volunteer: Volunteer | null;
  loading: boolean;
  signIn: (email: string, password: string, captchaToken: string) => Promise<{ error: any } | undefined>;
  signUp: (email: string, password: string, name: string, captchaToken: string) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Установка слушателя изменений аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Загружаем данные волонтера при изменении аутентификации
        if (currentSession?.user) {
          setTimeout(() => {
            loadVolunteerProfile(currentSession.user.id);
          }, 0);
        } else {
          setVolunteer(null);
        }
      }
    );

    // Проверка текущей сессии
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        loadVolunteerProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadVolunteerProfile = async (userId: string) => {
    const profile = await fetchVolunteerProfile(userId);
    if (profile) {
      setVolunteer(profile);
    }
  };

  const handleSignIn = async (email: string, password: string, captchaToken: string) => {
    return signIn(email, password, captchaToken);
  };

  const handleSignUp = async (email: string, password: string, name: string, captchaToken: string) => {
    return signUp(email, password, name, captchaToken);
  };

  const handleSignOut = async () => {
    await signOut();
    setVolunteer(null);
  };

  const value = {
    user,
    session,
    volunteer,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
