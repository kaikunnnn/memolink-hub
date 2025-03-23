
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  email: z.string().email({
    message: "有効なメールアドレスを入力してください。",
  }),
  name: z.string().min(1, {
    message: "名前を入力してください。",
  }).optional(),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, isLoading, isConfigured, updateEmail } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      name: "",
    },
  });

  useEffect(() => {
    if (user && user.email) {
      form.setValue('email', user.email);
      
      // プロフィール情報をSupabaseから取得
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
            
          if (data && data.name) {
            form.setValue('name', data.name);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };

      fetchProfile();
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setGeneralError(null);
    setIsSubmitting(true);
    
    try {
      // メールアドレスの更新が必要かチェック
      if (values.email !== user.email) {
        await updateEmail(values.email);
        toast.success("メールアドレス更新の確認メールを送信しました", {
          description: "メール内のリンクをクリックして更新を完了してください"
        });
      }
      
      // プロフィール情報の更新
      if (values.name) {
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            name: values.name 
          });
          
        if (error) throw error;
        
        toast.success("プロフィール情報を更新しました");
      }
      
      navigate('/account');
    } catch (error: any) {
      console.error('Profile update error:', error);
      setGeneralError(error.message || "プロフィールの更新に失敗しました。");
      toast.error("エラーが発生しました", {
        description: "プロフィールの更新に失敗しました"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <Button 
        variant="ghost" 
        className="w-fit mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        戻る
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>アカウント情報</CardTitle>
          <CardDescription>
            プロフィール情報を更新します
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generalError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
          
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
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名前</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="あなたの名前" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/reset-password')}
                  className="mr-4"
                >
                  パスワードをリセット
                </Button>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                      更新中...
                    </span>
                  ) : "変更を保存"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
