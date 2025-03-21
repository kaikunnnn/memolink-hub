
import { loadStripe } from '@stripe/stripe-js';
import { PlanType, BillingPeriod } from '@/types/subscription';
import { 
  createSubscription as mockCreateSubscription,
  createCustomerPortalUrl,
  createCheckoutSessionUrl,
  cancelSubscription as mockCancelSubscription
} from '@/api/mock/subscription';

// 環境変数またはハードコードされたパブリックキー（開発環境ではダミー値）
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key';

// Stripeの初期化
export const getStripe = async () => {
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  return stripePromise;
};

// プランIDを取得する関数
export const getPlanId = (planType: PlanType, billingPeriod: BillingPeriod): string => {
  // 実際のStripeプランID（開発環境ではダミー値）
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
    // 開発環境ではモックAPIを使用
    // 本番環境では実際のAPIエンドポイントを呼び出す
    const sessionUrl = await createCheckoutSessionUrl(planType, billingPeriod, userId);
    
    // 実際のStripeチェックアウトページへリダイレクトする代わりに
    // モックサブスクリプションを作成して成功を返す
    await mockCreateSubscription(userId, planType, billingPeriod);
    
    // 通常はStripeセッションIDを返すが、開発環境ではダミー値
    return `cs_test_${Math.random().toString(36).substring(2, 15)}`;
  } catch (error) {
    console.error('Stripeチェックアウトセッション作成エラー:', error);
    throw new Error('サブスクリプション処理中にエラーが発生しました');
  }
};

// ポータルセッションを作成するための関数
export const createCustomerPortalSession = async (userId: string) => {
  try {
    // 開発環境ではモックAPIを使用
    const portalUrl = await createCustomerPortalUrl(userId);
    
    return portalUrl;
  } catch (error) {
    console.error('Stripeポータルセッション作成エラー:', error);
    throw new Error('ポータルセッション作成中にエラーが発生しました');
  }
};

// サブスクリプションをキャンセルするための関数
export const cancelSubscription = async (subscriptionId: string, userId: string) => {
  try {
    // 開発環境ではモックAPIを使用
    const subscription = await mockCancelSubscription(subscriptionId, userId);
    
    return subscription;
  } catch (error) {
    console.error('Stripeサブスクリプションキャンセルエラー:', error);
    throw new Error('サブスクリプションのキャンセル中にエラーが発生しました');
  }
};
