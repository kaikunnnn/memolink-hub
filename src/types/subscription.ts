
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
  stripeIds: {
    monthly: string;
    quarterly: string;
  };
}

// 拡張されたBadgeバリアント
export type ExtendedBadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

// プラン機能の型（機能ごとのアクセス制御に使用）
export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  requiredPlan: PlanType;
}

// プラン別のコンテンツ制限設定
export const PLAN_FEATURE_ACCESS: Record<string, PlanType> = {
  // 基本機能
  'view_courses': 'free',
  'view_basic_content': 'free',
  'community_access': 'free',
  
  // スタンダードプラン機能
  'premium_courses': 'standard',
  'practice_questions': 'standard',
  'progress_tracking': 'standard',
  'full_content_access': 'standard',
  
  // フィードバックプラン機能
  'individual_feedback': 'feedback',
  'assignment_review': 'feedback',
  'priority_support': 'feedback',
  'group_qa_sessions': 'feedback'
};
