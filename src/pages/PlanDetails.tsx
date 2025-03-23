
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CreditCard, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const PlanDetails = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isLoading, error, fetchSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  // プラン名の日本語表示用マッピング
  const planTypeMap = {
    'standard': 'スタンダードプラン',
    'feedback': 'フィードバックプラン',
    'free': '無料プラン'
  };

  // 請求周期の日本語表示用マッピング
  const billingPeriodMap = {
    'monthly': '月額',
    'quarterly': '3ヶ月ごと',
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Stripeカスタマーポータルセッションの作成
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { customer_id: subscription?.stripeCustomerId }
      });

      if (error) throw error;
      
      // 成功したらStripeポータルへリダイレクト
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('サブスクリプション管理ページの読み込みに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    if (!confirm('サブスクリプションをキャンセルしますか？現在の期間終了後、サブスクリプションは更新されなくなります。')) {
      return;
    }

    setIsProcessing(true);
    try {
      // Stripeカスタマーポータルセッションの作成して解約ページへ
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { 
          customer_id: subscription.stripeCustomerId,
          return_url: `${window.location.origin}/account`,
        }
      });

      if (error) throw error;
      
      // 成功したらStripeポータルへリダイレクト
      window.location.href = data.url;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('サブスクリプションのキャンセルに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-1">
        <Button 
          variant="ghost" 
          className="w-fit mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        
        <h1 className="text-2xl font-bold mb-8">サブスクリプション情報</h1>
        
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>サブスクリプション情報の取得に失敗しました。再度お試しください。</AlertDescription>
          </Alert>
        ) : !subscription || subscription.planType === 'free' ? (
          <div className="space-y-6">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                現在、有料サブスクリプションに登録されていません。
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => navigate('/pricing')}>
              プランを選択する
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{planTypeMap[subscription.planType as keyof typeof planTypeMap] || subscription.planType}</CardTitle>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                    {subscription.status === 'active' ? 'アクティブ' : '非アクティブ'}
                  </Badge>
                </div>
                <CardDescription>
                  {billingPeriodMap[subscription.billingPeriod as keyof typeof billingPeriodMap] || subscription.billingPeriod}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    次回の請求日: {subscription.currentPeriodEnd ? 
                      format(new Date(subscription.currentPeriodEnd), 'yyyy年MM月dd日', { locale: ja }) : 
                      '情報なし'}
                  </span>
                </div>
                
                {subscription.cancelAtPeriodEnd && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      このサブスクリプションは現在の期間終了後にキャンセルされる予定です。
                      現在の期限が終了する{subscription.currentPeriodEnd ? 
                      format(new Date(subscription.currentPeriodEnd), 'yyyy年MM月dd日', { locale: ja }) : 
                      '(日付不明)'}まで引き続きご利用いただけます。
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Button 
                  className="w-full sm:w-auto"
                  onClick={handleManageSubscription}
                  disabled={isProcessing}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isProcessing ? 'お待ちください...' : 'お支払い方法を管理'}
                </Button>
                
                {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                  >
                    サブスクリプションをキャンセル
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">プランの変更</h2>
              <p className="text-muted-foreground mb-4">
                別のプランに切り替えるには、まず現在のサブスクリプションをキャンセルし、
                キャンセル後に新しいプランを選択してください。
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
              >
                利用可能なプランを表示
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanDetails;
