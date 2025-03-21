
import { loadStripe } from '@stripe/stripe-js';
import { PlanType, BillingPeriod } from '@/types/subscription';
import { getStripePriceId } from '@/utils/subscription';
import { supabase } from '@/lib/supabase';

// 環境変数またはハードコードされたパブリックキー
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key';

// Stripeの初期化
export const getStripe = async () => {
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  return stripePromise;
};

// チェックアウトセッションを作成するための関数
export const createCheckoutSession = async (
  planType: PlanType, 
  billingPeriod: BillingPeriod
) => {
  try {
    const session = supabase.auth.getSession();
    if (!session) {
      throw new Error('認証情報が見つかりません');
    }

    // 開発環境の場合はモックデータを使用
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_STRIPE) {
      // モックサブスクリプションを作成して成功を返す
      const { data: mockSubscription } = await supabase.functions.invoke('mock-checkout-session', {
        body: { planType, billingPeriod },
      });
      return mockSubscription.sessionId;
    }

    // 本番環境ではSupabase Edge Functionを使用
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        planType, 
        billingPeriod,
        returnUrl: window.location.origin
      },
    });

    if (error) throw error;

    // Stripeのチェックアウトページへリダイレクト
    window.location.href = data.url;
    
    // 通常はここに到達しない（リダイレクト前）
    return null;
  } catch (error) {
    console.error('Stripeチェックアウトセッション作成エラー:', error);
    throw new Error('サブスクリプション処理中にエラーが発生しました');
  }
};

// ポータルセッションを作成するための関数
export const createCustomerPortalSession = async () => {
  try {
    // 開発環境の場合はモックデータを使用
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_STRIPE) {
      return `/account?portal=true&mock=true`;
    }

    // 本番環境ではSupabase Edge Functionを使用
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { returnUrl: window.location.origin + '/account' },
    });

    if (error) throw error;

    // Stripeの顧客ポータルへリダイレクト
    window.location.href = data.url;
    
    // 通常はここに到達しない（リダイレクト前）
    return null;
  } catch (error) {
    console.error('Stripeポータルセッション作成エラー:', error);
    throw new Error('ポータルセッション作成中にエラーが発生しました');
  }
};

// サブスクリプションをキャンセルするための関数
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    // 開発環境の場合はモックデータを使用
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_STRIPE) {
      const { data: mockCancellation } = await supabase.functions.invoke('mock-cancel-subscription', {
        body: { subscriptionId },
      });
      return mockCancellation;
    }

    // 本番環境では顧客ポータルを使用
    return await createCustomerPortalSession();
  } catch (error) {
    console.error('Stripeサブスクリプションキャンセルエラー:', error);
    throw new Error('サブスクリプションのキャンセル中にエラーが発生しました');
  }
};
