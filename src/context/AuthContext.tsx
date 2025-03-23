import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string, accessToken?: string | null, refreshToken?: string | null) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateEmail: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());
  const { toast: uiToast } = useToast();

  useEffect(() => {
    // Check if Supabase is configured
    if (!isConfigured) {
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
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
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
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
        try {
          // プロフィールテーブルが存在するか確認
          const { error: tableCheckError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
            
          // テーブルが存在しない場合、エラーをスキップして成功メッセージを表示
          if (tableCheckError) {
            console.warn('Profiles table not found:', tableCheckError);
            uiToast({
              title: "アカウント作成成功",
              description: "ただし、プロフィールテーブルが設定されていないため、プロフィール情報は保存されませんでした。Supabaseダッシュボードでテーブルを作成してください。",
            });
            return;
          }
          
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
            console.error('Profile creation error:', profileError);
            // プロフィール作成に失敗してもサインアップ自体は成功とする
            uiToast({
              title: "アカウント作成成功",
              description: "プロフィール情報の保存に失敗しました。管理者にお問い合わせください。",
            });
            return;
          }
        } catch (profileErr) {
          console.error('Profile creation exception:', profileErr);
          // プロフィール作成時の例外でもサインアップ自体は成功とする
          uiToast({
            title: "アカウント作成成功",
            description: "プロフィール情報の保存に失敗しました。管理者にお問い合わせください。",
          });
          return;
        }

        uiToast({
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
        } else if (error.code === "over_email_send_rate_limit") {
          errorMessage = "セキュリティのため短時間での複数回のリクエストはできません。しばらくしてからお試しください。";
        }
      }
      
      uiToast({
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
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
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

      uiToast({
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
      
      uiToast({
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
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      uiToast({
        title: "ログアウトしました",
        description: "正常にログアウトしました。",
      });
    } catch (error: any) {
      console.error('Error during sign out:', error);
      
      uiToast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ログアウトに失敗しました。",
      });
      
      throw error;
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        throw error;
      }

      return;
    } catch (error: any) {
      console.error('Error during password reset:', error);
      
      let errorMessage = "パスワードリセットに失敗しました。";
      if (error.message) {
        if (error.message.includes("User not found")) {
          errorMessage = "このメールアドレスは登録されていません。";
        } else if (error.code === "over_email_send_rate_limit") {
          errorMessage = "セキュリティのため短時間での複数回のリクエストはできません。しばらくしてからお試しください。";
        }
      }
      
      uiToast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  // パスワード更新
  const updatePassword = async (password: string, accessToken?: string | null, refreshToken?: string | null) => {
    if (!isConfigured) {
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
      return;
    }
    
    try {
      let error;
      
      // アクセストークンがある場合（パスワードリセット時）
      if (accessToken) {
        // セッションを更新
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (sessionError) throw sessionError;
        
        // パスワード更新
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        
        error = updateError;
      } else {
        // 通常のパスワード更新（ログイン中）
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        
        error = updateError;
      }
      
      if (error) {
        throw error;
      }

      return;
    } catch (error: any) {
      console.error('Error during password update:', error);
      
      let errorMessage = "パスワードの更新に失敗しました。";
      if (error.message) {
        if (error.message.includes("Token expired")) {
          errorMessage = "リンクの有効期限が切れています。もう一度パスワードリセットを行ってください。";
        } else if (error.message.includes("Invalid JWT")) {
          errorMessage = "無効なトークンです。もう一度パスワードリセットを行ってください。";
        }
      }
      
      uiToast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  // メールアドレス更新
  const updateEmail = async (email: string) => {
    if (!isConfigured) {
      console.warn("Supabase configuration missing - Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      toast.error("Supabase configuration missing");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      });
      
      if (error) {
        throw error;
      }

      return;
    } catch (error: any) {
      console.error('Error during email update:', error);
      
      let errorMessage = "メールアドレスの更新に失敗しました。";
      if (error.message) {
        if (error.message.includes("already in use")) {
          errorMessage = "このメールアドレスは既に使用されています。";
        }
      }
      
      uiToast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: errorMessage,
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
    resetPassword,
    updatePassword,
    updateEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
