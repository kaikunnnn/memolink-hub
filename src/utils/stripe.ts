
import { loadStripe } from '@stripe/stripe-js';
import { PlanType, BillingPeriod } from '@/types/subscription';

// 環境変数またはハードコードされたパブリックキー（本番環境では環境変数を使用）
// 実際のプロジェクトでは公開可能なキーのみをフロントエンドで使用
const STRIPE_PUBLIC_KEY = 'pk_test_your_stripe_public_key';

// Stripeの初期化
export const getStripe = async () => {
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  return stripePromise;
};

// プランIDを取得する関数
export const getPlanId = (planType: PlanType, billingPeriod: BillingPeriod): string => {
  // 実際のStripeプランID
  const planIds = {
    standard: {
      monthly: 'price_standard_monthly',
      quarterly: 'price_standard_quarterly'
    },
    feedback: {
      monthly: 'price_feedback_monthly',
      quarterly: 'price_feedback_quarterly'
    }
  };
  
  return planIds[planType][billingPeriod];
};

// チェックアウトセッションを作成するための関数
export const createCheckoutSession = async (
  planType: PlanType, 
  billingPeriod: BillingPeriod,
  userId: string
) => {
  try {
    // バックエンドAPIを呼び出してチェックアウトセッションを作成
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType,
        billingPeriod,
        userId,
        planId: getPlanId(planType, billingPeriod)
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'チェックアウトセッションの作成に失敗しました');
    }
    
    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error('Stripeチェックアウトセッション作成エラー:', error);
    throw new Error('サブスクリプション処理中にエラーが発生しました');
  }
};

// ポータルセッションを作成するための関数
export const createCustomerPortalSession = async (userId: string) => {
  try {
    // バックエンドAPIを呼び出してポータルセッションを作成
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ポータルセッションの作成に失敗しました');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Stripeポータルセッション作成エラー:', error);
    throw new Error('ポータルセッション作成中にエラーが発生しました');
  }
};

// サブスクリプションをキャンセルするための関数
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    // バックエンドAPIを呼び出してサブスクリプションをキャンセル
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'サブスクリプションのキャンセルに失敗しました');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Stripeサブスクリプションキャンセルエラー:', error);
    throw new Error('サブスクリプションのキャンセル中にエラーが発生しました');
  }
};
