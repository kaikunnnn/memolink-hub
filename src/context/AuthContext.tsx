
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // セッションがあるかを確認
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
        setIsLoading(false);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      setIsLoading(false);
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
  }, []);

  // サインアップ
  const signUp = async (email: string, password: string, name: string) => {
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
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
