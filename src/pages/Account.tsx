
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { AlertCircle, CreditCard, Edit, ExternalLink, LogOut, UserCircle } from "lucide-react";
import SupabaseConfigGuide from '@/components/SupabaseConfigGuide';
import { toast } from "sonner";

const Account = () => {
  const navigate = useNavigate();
  const { user, signOut, isConfigured } = useAuth();
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // プラン名の日本語表示用マッピング
  const planTypeMap = {
    'standard': 'スタンダードプラン',
    'feedback': 'フィードバックプラン',
    'free': '無料プラン'
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success("ログアウトしました");
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("ログアウトに失敗しました", {
        description: "もう一度お試しください"
      });
      setIsSigningOut(false);
    }
  };

  // Supabase設定が必要な場合のガイド表示
  if (!isConfigured) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">アカウント</h1>
        <SupabaseConfigGuide />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">アカウント</h1>
      
      {user ? (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        <UserCircle className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{user.user_metadata?.name || user.email}</CardTitle>
                      <CardDescription className="mt-1">{user.email}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/edit-profile')}>
                    <Edit className="mr-2 h-4 w-4" /> 編集
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">メールアドレス</h3>
                    <p>{user.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">アカウント作成日</h3>
                    <p>{new Date(user.created_at).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/update-password')}>
                  パスワードを変更
                </Button>
                <Button variant="destructive" onClick={handleSignOut} disabled={isSigningOut}>
                  {isSigningOut ? "ログアウト中..." : "ログアウト"}
                  <LogOut className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>サブスクリプション情報</CardTitle>
                <CardDescription>現在のプランと支払い状況</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSubscription ? (
                  <p>読み込み中...</p>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="font-medium">現在のプラン:</h3>
                        <Badge className="ml-2">
                          {planTypeMap[subscription.planType as keyof typeof planTypeMap] || subscription.planType}
                        </Badge>
                      </div>
                      <Badge variant={subscription.status === 'active' ? 'outline' : 'destructive'}>
                        {subscription.status === 'active' ? 'アクティブ' : '非アクティブ'}
                      </Badge>
                    </div>
                    
                    {subscription.cancelAtPeriodEnd && (
                      <Alert className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          このサブスクリプションは現在の期間終了後にキャンセルされる予定です。
                          {subscription.currentPeriodEnd && 
                            ` ${new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')}まで利用可能です。`}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">次回の請求日:</h3>
                      <p>{subscription.currentPeriodEnd ? 
                        new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP') : 
                        '情報なし'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">現在、有料プランに登録されていません</p>
                    <Button onClick={() => navigate('/pricing')}>
                      プランを選択する
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate('/plan-details')} className="w-full sm:w-auto">
                  <CreditCard className="mr-2 h-4 w-4" />
                  プランの詳細と管理
                </Button>
                {subscription && subscription.status === 'active' && (
                  <Button variant="outline" onClick={() => navigate('/pricing')} className="w-full sm:w-auto">
                    利用可能なプランを表示
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">ログインが必要です</h2>
          <p className="text-muted-foreground mb-6">アカウント情報を表示するには、ログインしてください。</p>
          <Button asChild>
            <Link to="/signin">ログイン</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Account;
