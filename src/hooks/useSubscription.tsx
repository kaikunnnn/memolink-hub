
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Subscription, 
  PlanType, 
  BillingPeriod, 
  CreateSubscriptionData 
} from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  createSubscription: (data: CreateSubscriptionData) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

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
        // 実際の実装ではSupabaseやAPIからデータを取得
        // 現在はモックデータを返す
        const mockSubscriptionData = localStorage.getItem('mockSubscription');
        
        if (mockSubscriptionData) {
          const parsedData = JSON.parse(mockSubscriptionData);
          // ユーザーIDが一致する場合のみ設定（異なるユーザーがログインした場合用）
          if (parsedData.userId === user.id) {
            setSubscription(parsedData);
          } else {
            setSubscription(null);
          }
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
      // 実際の実装ではStripeのチェックアウトセッション作成やSupabaseへの保存処理
      // 現在はモックデータを作成して保存
      
      // 本来はStripeから返ってくる情報を元に作成される
      const mockSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId: user.id,
        planType: data.planType,
        billingPeriod: data.billingPeriod,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(
          Date.now() + (data.billingPeriod === 'monthly' ? 30 : 90) * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stripeCustomerId: `cus_${Date.now()}`,
        stripeSubscriptionId: `sub_${Date.now()}`
      };

      // ローカルストレージに保存（実際の実装ではSupabaseに保存）
      localStorage.setItem('mockSubscription', JSON.stringify(mockSubscription));
      
      setSubscription(mockSubscription);
      toast.success('サブスクリプションの登録が完了しました！');
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
      // 実際の実装ではStripeのサブスクリプションキャンセル処理
      // 現在はモックデータを更新
      const updatedSubscription: Subscription = {
        ...subscription,
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date().toISOString()
      };

      // ローカルストレージに保存（実際の実装ではSupabaseに保存）
      localStorage.setItem('mockSubscription', JSON.stringify(updatedSubscription));
      
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

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    cancelSubscription
  };
}
