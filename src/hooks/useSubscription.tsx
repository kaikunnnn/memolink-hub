
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BillingPeriod, PlanType } from '@/types/subscription';
import { toast } from 'sonner';
import { getSubscription } from '@/api/mock/subscription';
import { createCheckoutSession, createCustomerPortalSession, cancelSubscription } from '@/utils/stripe';
import { useNavigate } from 'react-router-dom';

interface CreateSubscriptionParams {
  planType: PlanType;
  billingPeriod: BillingPeriod;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // サブスクリプション情報を取得
  const fetchSubscription = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const subscriptionData = await getSubscription(user.id);
      setSubscription(subscriptionData);
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
      const sessionId = await createCheckoutSession(planType, billingPeriod, user.id);
      toast.success('サブスクリプションが作成されました');
      
      // 実際のStripeチェックアウトページへリダイレクトする代わりに
      // サブスクリプション情報を再取得する
      await fetchSubscription();
      
      // 通常はStripeのチェックアウトページへリダイレクト
      // const stripe = await getStripe();
      // await stripe?.redirectToCheckout({ sessionId });
      
      navigate('/account');
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
      const url = await createCustomerPortalSession(user.id);
      
      // 実際のStripeポータルページへリダイレクトする代わりに
      // トーストメッセージを表示
      toast.info('本番環境ではStripeの顧客ポータルが開きます');
      
      // 通常はStripeの顧客ポータルへリダイレクト
      // window.location.href = url;
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
    if (!user?.id || !subscription?.stripe_subscription_id) {
      toast.error('有効なサブスクリプションがありません');
      return;
    }

    setIsLoading(true);
    try {
      await cancelSubscription(subscription.stripe_subscription_id, user.id);
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
