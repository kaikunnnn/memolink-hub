
import { BillingPeriod, PlanType } from '@/types/subscription';

// モックのサブスクリプションデータを管理
let mockSubscriptions: any[] = [];

// サブスクリプション作成のモック
export const createSubscription = async (userId: string, planType: PlanType, billingPeriod: BillingPeriod) => {
  const now = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (billingPeriod === 'monthly' ? 1 : 3));
  
  const subscription = {
    id: `sub_${Math.random().toString(36).substring(2, 11)}`,
    user_id: userId,
    plan_type: planType,
    billing_period: billingPeriod,
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    stripe_customer_id: `cus_${Math.random().toString(36).substring(2, 11)}`,
    stripe_subscription_id: `sub_${Math.random().toString(36).substring(2, 11)}`,
  };
  
  // 既存のサブスクリプションをキャンセル
  mockSubscriptions = mockSubscriptions.filter(sub => sub.user_id !== userId);
  
  // 新しいサブスクリプションを追加
  mockSubscriptions.push(subscription);
  
  return subscription;
};

// サブスクリプション取得のモック
export const getSubscription = async (userId: string) => {
  return mockSubscriptions.find(sub => sub.user_id === userId && sub.status === 'active') || null;
};

// サブスクリプションキャンセルのモック
export const cancelSubscription = async (subscriptionId: string, userId: string) => {
  const subscription = mockSubscriptions.find(
    sub => (sub.id === subscriptionId || sub.stripe_subscription_id === subscriptionId) && sub.user_id === userId
  );
  
  if (subscription) {
    subscription.status = 'canceled';
    subscription.cancel_at_period_end = true;
    subscription.updated_at = new Date().toISOString();
  }
  
  return subscription;
};

// 顧客ポータルURLの生成モック
export const createCustomerPortalUrl = async (userId: string) => {
  return `/account?portal=true&user=${userId}`;
};

// チェックアウトセッションURLの生成モック
export const createCheckoutSessionUrl = async (planType: PlanType, billingPeriod: BillingPeriod, userId: string) => {
  return `/checkout?plan=${planType}&billing=${billingPeriod}&user=${userId}`;
};
