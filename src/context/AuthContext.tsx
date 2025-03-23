import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isPending: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initializeAuth = async () => {
      setIsPending(true);
      
      // Check if Supabase is configured
      if (!supabase) {
        console.warn("Supabase is not configured. Ensure environment variables are set.");
        setIsInitialized(true);
        setIsPending(false);
        return;
      }

      const initialSession = await supabase.auth.getSession();
      setSession(initialSession.data.session);
      setUser(initialSession.data.session?.user || null);
      setIsInitialized(true);
      setIsPending(false);

      supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        setUser(session?.user || null);
      });
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          }
        }
      });
      if (error) {
        throw error;
      }
      setSession(data.session);
      setUser(data.user);
    } finally {
      setIsPending(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      setSession(data.session);
      setUser(data.user);
    } finally {
      setIsPending(false);
    }
  };

  const signOut = async () => {
    setIsPending(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setUser(null);
    } finally {
      setIsPending(false);
    }
  };

  // パスワードリセット機能を追加
  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      throw error;
    }
  };

  // パスワード更新機能を追加
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!supabase || !session) {
      throw new Error('Not authenticated or Supabase client not initialized');
    }
    
    // 現在のパスワードで認証確認
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    });
    
    if (signInError) {
      throw signInError;
    }
    
    // 新しいパスワードに更新
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw error;
    }
  };

  // メールアドレス更新機能を追加
  const updateEmail = async (newEmail: string, password: string) => {
    if (!supabase || !session) {
      throw new Error('Not authenticated or Supabase client not initialized');
    }
    
    // 現在のパスワードで認証確認
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: password,
    });
    
    if (signInError) {
      throw signInError;
    }
    
    // 新しいメールアドレスに更新
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (error) {
      throw error;
    }
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    isPending,
    isInitialized,
    isAuthenticated: !!user,
    isConfigured: !!supabase,
    resetPassword,   // 追加
    updatePassword,  // 追加
    updateEmail,     // 追加
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
