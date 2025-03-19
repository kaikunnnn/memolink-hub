
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase is configured
    if (!isConfigured) {
      sonnerToast.error({
        title: "Supabase configuration missing",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
      });
      setIsLoading(false);
      return;
    }

    // セッションがあるかを確認
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setIsLoading(false);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchSession:', error);
        setIsLoading(false);
      }
    };

    fetchSession();

    // セッションの変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // サインアップ
  const signUp = async (email: string, password: string, name: string) => {
    if (!isConfigured) {
      sonnerToast.error({
        title: "Supabase configuration missing",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // プロフィールデータベースにユーザー情報を保存
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              bio: '',
            },
          ]);

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "アカウント作成成功",
          description: "確認メールを送信しました。メールを確認してください。",
        });
      }
    } catch (error: any) {
      console.error('Error during sign up:', error);
      
      let errorMessage = "アカウント作成に失敗しました。";
      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "このメールアドレスは既に登録されています。";
        }
      }
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  // サインイン
  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      sonnerToast.error({
        title: "Supabase configuration missing",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "ログイン成功",
        description: "アカウントにログインしました。",
      });
    } catch (error: any) {
      console.error('Error during sign in:', error);
      
      let errorMessage = "ログインに失敗しました。";
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "メールアドレスまたはパスワードが正しくありません。";
        }
      }
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  // サインアウト
  const signOut = async () => {
    if (!isConfigured) {
      sonnerToast.error({
        title: "Supabase configuration missing",
        description: "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: "ログアウトしました",
        description: "正常にログアウトしました。",
      });
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ログアウトに失敗しました。",
      });
      
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isConfigured,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
