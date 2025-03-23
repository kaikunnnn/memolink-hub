
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import SupabaseConfigGuide from '@/components/SupabaseConfigGuide';

const formSchema = z.object({
  password: z.string().min(8, {
    message: "パスワードは8文字以上である必要があります。",
  }),
  confirmPassword: z.string().min(8, {
    message: "パスワードは8文字以上である必要があります。",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません。",
  path: ["confirmPassword"],
});

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, isConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // URLからトークンを取得
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  
  // トークンが存在するか確認
  useEffect(() => {
    if (!accessToken) {
      setGeneralError("有効なトークンがありません。パスワードリセットのメールから再度アクセスしてください。");
    }
  }, [accessToken]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!accessToken) {
      setGeneralError("有効なトークンがありません。パスワードリセットのメールから再度アクセスしてください。");
      return;
    }

    setGeneralError(null);
    setIsSubmitting(true);
    
    try {
      await updatePassword(values.password, accessToken, refreshToken);
      setSuccess(true);
      toast.success("パスワードが正常に更新されました", {
        description: "新しいパスワードでログインできます"
      });
    } catch (error) {
      console.error('Password update error:', error);
      setGeneralError("パスワードの更新に失敗しました。もう一度お試しください。");
      toast.error("エラーが発生しました", {
        description: "パスワードの更新に失敗しました"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supabaseが設定されていない場合、設定ガイドを表示
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col bg-background pt-16">
        <div className="container max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <Button 
            variant="ghost" 
            className="w-fit mb-6" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          
          <SupabaseConfigGuide />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      <div className="container max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <Button 
          variant="ghost" 
          className="w-fit mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">新しいパスワードを設定</h1>
          <p className="text-muted-foreground">
            安全な新しいパスワードを入力してください
          </p>
        </div>

        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <Alert className="mb-6">
              <AlertDescription>
                パスワードが正常に更新されました。新しいパスワードでログインできます。
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link to="/signin">ログインページへ</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新しいパスワード</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>パスワード（確認）</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting || !accessToken}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    更新中...
                  </span>
                ) : "パスワードを更新"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
