
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Subscription, 
  PlanType, 
  BillingPeriod, 
  CreateSubscriptionData 
} from '@/types/subscription';
import { 
  createCheckoutSession, 
  createCustomerPortalSession, 
  getStripe, 
  cancelSubscription as cancelStripeSubscription
} from '@/utils/stripe';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  createSubscription: (data: CreateSubscriptionData) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  manageSubscription: () => Promise<void>;
}

// SupabaseからサブスクリプションデータをフェッチするためのAPI URL
const SUBSCRIPTION_API = '/api/subscription';

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // サブスクリプション情報を取得
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // APIからサブスクリプションデータを取得
        const response = await fetch(`${SUBSCRIPTION_API}?userId=${user.id}`);
        
        if (!response.ok) {
          // 404の場合はサブスクリプションがないだけなのでエラーとしない
          if (response.status === 404) {
            setSubscription(null);
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.message || 'サブスクリプション情報の取得に失敗しました');
        }
        
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        console.error('サブスクリプション取得エラー:', err);
        setError(err instanceof Error ? err : new Error('サブスクリプション情報の取得に失敗しました'));
        
        // デモ実装: エラーが発生した場合、ローカルストレージから取得を試みる
        const mockSubscriptionData = localStorage.getItem('mockSubscription');
        if (mockSubscriptionData) {
          try {
            const parsedData = JSON.parse(mockSubscriptionData);
            if (parsedData.userId === user.id) {
              setSubscription(parsedData);
            }
          } catch (parseErr) {
            console.error('モックデータのパースエラー:', parseErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // サブスクリプション作成（購入処理）
  const createSubscription = async (data: CreateSubscriptionData) => {
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stripeチェックアウトセッションを作成
      const sessionId = await createCheckoutSession(
        data.planType,
        data.billingPeriod,
        user.id
      );

      // Stripeオブジェクトを取得
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripeの読み込みに失敗しました');
      }

      // Stripeチェックアウトにリダイレクト
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
      
      toast.success('Stripeの決済ページに移動します');
    } catch (err) {
      console.error('サブスクリプション作成エラー:', err);
      const errorObj = err instanceof Error ? err : new Error('サブスクリプション作成に失敗しました');
      setError(errorObj);
      toast.error('サブスクリプション処理中にエラーが発生しました');
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  // サブスクリプションのキャンセル
  const cancelSubscription = async () => {
    if (!user || !subscription) {
      throw new Error('キャンセルするサブスクリプションがありません');
    }

    setIsLoading(true);
    setError(null);

    try {
      // StripeのAPIを使用してサブスクリプションをキャンセル
      await cancelStripeSubscription(subscription.stripeSubscriptionId);
      
      // API経由でデータベースを更新
      const response = await fetch(`${SUBSCRIPTION_API}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscriptionId: subscription.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'サブスクリプションのキャンセルに失敗しました');
      }
      
      const updatedSubscription = await response.json();
      setSubscription(updatedSubscription);
      
      toast.success('サブスクリプションのキャンセルが完了しました。期間終了まで引き続きご利用いただけます。');
    } catch (err) {
      console.error('サブスクリプションキャンセルエラー:', err);
      const errorObj = err instanceof Error ? err : new Error('サブスクリプションのキャンセルに失敗しました');
      setError(errorObj);
      toast.error('キャンセル処理中にエラーが発生しました');
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  // Stripeカスタマーポータルでサブスクリプションを管理
  const manageSubscription = async () => {
    if (!user || !subscription) {
      throw new Error('管理するサブスクリプションがありません');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stripeカスタマーポータルのセッションを作成
      const portalUrl = await createCustomerPortalSession(user.id);
      
      // ポータルURLにリダイレクト
      window.location.href = portalUrl;
      
      toast.success('Stripeカスタマーポータルへリダイレクトします');
    } catch (err) {
      console.error('サブスクリプション管理エラー:', err);
      const errorObj = err instanceof Error ? err : new Error('サブスクリプション管理画面への遷移に失敗しました');
      setError(errorObj);
      toast.error('処理中にエラーが発生しました');
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    cancelSubscription,
    manageSubscription
  };
}
