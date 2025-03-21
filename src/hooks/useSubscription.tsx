
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BillingPeriod, PlanType, Subscription } from '@/types/subscription';
import { toast } from 'sonner';
import { createCheckoutSession, createCustomerPortalSession, cancelSubscription } from '@/utils/stripe';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface CreateSubscriptionParams {
  planType: PlanType;
  billingPeriod: BillingPeriod;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // サブスクリプション情報を取得
  const fetchSubscription = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Supabaseからサブスクリプション情報を取得
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        // PGRST116はデータが見つからないエラーなので無視
        console.error('サブスクリプション取得エラー:', subscriptionError);
        throw new Error('サブスクリプション情報の取得に失敗しました');
      }

      if (subscriptionData) {
        // APIレスポンスをフロントエンドの型に変換
        setSubscription({
          id: subscriptionData.id,
          userId: subscriptionData.user_id,
          planType: subscriptionData.plan_type as PlanType,
          billingPeriod: subscriptionData.billing_period as BillingPeriod,
          status: subscriptionData.status as any,
          currentPeriodStart: subscriptionData.current_period_start,
          currentPeriodEnd: subscriptionData.current_period_end,
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          createdAt: subscriptionData.created_at,
          updatedAt: subscriptionData.updated_at,
          stripeCustomerId: subscriptionData.stripe_customer_id,
          stripeSubscriptionId: subscriptionData.stripe_subscription_id
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('サブスクリプション取得エラー:', err);
      setError(err instanceof Error ? err : new Error('サブスクリプション情報の取得に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  };

  // サブスクリプションを作成または変更
  const createSubscription = async ({ planType, billingPeriod }: CreateSubscriptionParams) => {
    if (!user?.id) {
      toast.error('ログインが必要です');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await createCheckoutSession(planType, billingPeriod);
      // リダイレクト後の処理のためここではtoastを表示しない
    } catch (err) {
      console.error('サブスクリプション作成エラー:', err);
      toast.error(err instanceof Error ? err.message : 'サブスクリプションの作成に失敗しました');
      setError(err instanceof Error ? err : new Error('サブスクリプションの作成に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  };

  // 顧客ポータルへのリダイレクト
  const redirectToCustomerPortal = async () => {
    if (!user?.id) {
      toast.error('ログインが必要です');
      return;
    }

    setIsLoading(true);
    try {
      await createCustomerPortalSession();
      // リダイレクト後の処理のためここではtoastを表示しない
    } catch (err) {
      console.error('ポータルセッション作成エラー:', err);
      toast.error(err instanceof Error ? err.message : 'ポータルセッションの作成に失敗しました');
      setError(err instanceof Error ? err : new Error('ポータルセッションの作成に失敗しました'));
    } finally {
      setIsLoading(false);
    }
  };

  // サブスクリプションのキャンセル
  const cancelUserSubscription = async () => {
    if (!user?.id || !subscription?.stripeSubscriptionId) {
      toast.error('有効なサブスクリプションがありません');
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription(subscription.stripeSubscriptionId);
      toast.success('サブスクリプションは現在の期間終了時にキャンセルされます');
      await fetchSubscription();
    } catch (err) {
      console.error('サブスクリプションキャンセルエラー:', err);
      toast.error(err instanceof Error ? err.message : 'サブスクリプションのキャンセルに失敗しました');
      setError(err instanceof Error ? err : new Error('サブスクリプションのキャンセルに失敗しました'));
    } finally {
      setIsLoading(false);
    }
  };

  // URLパラメータによる処理
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('サブスクリプションが正常に作成されました');
      fetchSubscription();
    } else if (params.get('canceled') === 'true') {
      toast.info('サブスクリプションの作成がキャンセルされました');
    }
  }, []);

  // ユーザーIDが変更されたら（ログイン/ログアウト時）サブスクリプション情報を再取得
  useEffect(() => {
    if (user?.id) {
      fetchSubscription();
    } else {
      setSubscription(null);
    }
  }, [user?.id]);

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    redirectToCustomerPortal,
    cancelSubscription: cancelUserSubscription,
    fetchSubscription
  };
};

export default useSubscription;
