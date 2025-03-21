
// サブスクリプション関連の型定義

// サブスクリプションプラン種類
export type PlanType = 'free' | 'standard' | 'feedback';

// 課金期間
export type BillingPeriod = 'monthly' | 'quarterly';

// サブスクリプションステータス
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

// サブスクリプション情報の型
export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  currentPeriodStart: string; // ISO日付文字列
  currentPeriodEnd: string; // ISO日付文字列
  cancelAtPeriodEnd: boolean;
  createdAt: string; // ISO日付文字列
  updatedAt: string; // ISO日付文字列
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// サブスクリプション作成時のデータ型
export interface CreateSubscriptionData {
  planType: PlanType;
  billingPeriod: BillingPeriod;
}

// プラン情報の型
export interface PlanInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  prices: {
    monthly: number;
    quarterly: number;
  };
}

// 拡張されたBadgeバリアント
export type ExtendedBadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
