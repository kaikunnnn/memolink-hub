
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { ArrowLeft, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import SupabaseConfigGuide from '@/components/SupabaseConfigGuide';

const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, isConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setGeneralError(null);
    setIsSubmitting(true);
    
    try {
      await resetPassword(values.email);
      setSuccess(true);
      toast.success("パスワードリセットのメールを送信しました", {
        description: "メールのリンクからパスワードをリセットしてください"
      });
    } catch (error) {
      console.error('Password reset error:', error);
      setGeneralError("パスワードリセットメールの送信に失敗しました。もう一度お試しください。");
      toast.error("エラーが発生しました", {
        description: "パスワードリセットに失敗しました"
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
          <h1 className="text-2xl font-bold tracking-tight">パスワードをリセット</h1>
          <p className="text-muted-foreground">
            登録したメールアドレスを入力してください
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
                パスワードリセットのメールを送信しました。メールのリンクからパスワードをリセットしてください。
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link to="/signin">ログインページへ戻る</Link>
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="your@email.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    送信中...
                  </span>
                ) : "パスワードリセットメールを送信"}
              </Button>

              <div className="text-center">
                <Link to="/signin" className="text-sm text-primary hover:underline">
                  ログインページに戻る
                </Link>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
