
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SupabaseSetupGuide from '@/components/SupabaseSetupGuide';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { 
  formatDate, 
  planDisplayNames, 
  periodDisplayNames, 
  statusDisplayInfo 
} from '@/utils/subscription';

const Account = () => {
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { 
    subscription, 
    isLoading: isSubscriptionLoading, 
    cancelSubscription 
  } = useSubscription();

  // サブスクリプションキャンセルの処理
  const handleCancelSubscription = async () => {
    try {
      toast("サブスクリプションのキャンセル処理中...");
      await cancelSubscription();
    } catch (error) {
      console.error('キャンセル処理エラー:', error);
    }
  };

  // プラン変更ページへの遷移
  const handleChangePlan = () => {
    navigate('/pricing');
  };
  
  // Supabaseが設定されていない場合
  if (!isConfigured) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
        <SupabaseSetupGuide />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      
      {user ? (
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">プロフィール</TabsTrigger>
            <TabsTrigger value="subscription">サブスクリプション</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>プロフィール情報</CardTitle>
                <CardDescription>アカウント情報の確認・編集ができます</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">メールアドレス</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">ユーザーID</p>
                    <p className="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>サブスクリプション情報</CardTitle>
                <CardDescription>現在のプランと支払い情報を確認できます</CardDescription>
              </CardHeader>
              <CardContent>
                {isSubscriptionLoading ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">現在のプラン</p>
                      <div className="flex items-center gap-2">
                        <span>{planDisplayNames[subscription.planType]}</span>
                        {subscription.billingPeriod && (
                          <span>（{periodDisplayNames[subscription.billingPeriod]}）</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="font-medium">ステータス</p>
                      <Badge variant={statusDisplayInfo[subscription.status].color as "default" | "secondary" | "destructive" | "outline" | "success" | "warning"}>
                        {statusDisplayInfo[subscription.status].label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="font-medium">次回更新日</p>
                      <span>{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {subscription.status === 'canceled' 
                          ? '現在のプランは期間終了後に自動的に停止します。' 
                          : 'サブスクリプションはいつでも変更またはキャンセルできます。'}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={handleChangePlan} 
                          variant="outline" 
                          className="flex-1"
                        >
                          プラン変更
                        </Button>
                        {subscription.status !== 'canceled' && (
                          <Button 
                            onClick={handleCancelSubscription} 
                            variant="destructive" 
                            className="flex-1"
                          >
                            サブスクリプションをキャンセル
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <p className="text-center text-muted-foreground mb-4">
                      現在、アクティブなサブスクリプションはありません。
                    </p>
                    <Button onClick={handleChangePlan} className="w-full">
                      プランに登録する
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-10">
          <p>ログインしていません。ログインしてください。</p>
        </div>
      )}
    </div>
  );
};

export default Account;
