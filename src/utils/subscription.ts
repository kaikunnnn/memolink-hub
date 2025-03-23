
import { BillingPeriod, ExtendedBadgeVariant, PlanType, SubscriptionStatus } from '@/types/subscription';

/**
 * プラン表示名のマッピング
 */
export const planDisplayNames: Record<PlanType, string> = {
  free: '無料プラン',
  standard: 'スタンダードプラン',
  feedback: 'フィードバックプラン'
};

/**
 * 課金期間表示名のマッピング
 */
export const periodDisplayNames: Record<BillingPeriod, string> = {
  monthly: '月額',
  quarterly: '3ヶ月'
};

/**
 * サブスクリプションステータスの表示情報
 */
export const statusDisplayInfo: Record<SubscriptionStatus, { 
  label: string; 
  color: ExtendedBadgeVariant 
}> = {
  active: { label: '有効', color: 'success' },
  trialing: { label: '試用期間中', color: 'success' },
  canceled: { label: 'キャンセル済み', color: 'warning' },
  incomplete: { label: '未完了', color: 'warning' },
  past_due: { label: '支払い遅延', color: 'destructive' }
};

/**
 * 日付をフォーマットする関数
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Stripe価格IDを取得する関数
 * 
 * @param planType プランタイプ（'standard' or 'feedback'）
 * @param billingPeriod 課金期間（'monthly' or 'quarterly'）
 * @returns Stripe価格ID
 */
export const getStripePriceId = (planType: PlanType, billingPeriod: BillingPeriod): string => {
  // プランと課金期間に基づいて価格IDを返す
  if (planType === 'standard') {
    return billingPeriod === 'monthly' 
      ? 'price_1OIiOUKUVUnt8GtyOfXEoEvW' // スタンダード月額
      : 'price_1OIiPpKUVUnt8Gty0OH3Pyip' // スタンダード3ヶ月
  } else if (planType === 'feedback') {
    return billingPeriod === 'monthly' 
      ? 'price_1OIiMRKUVUnt8GtyMGSJIH8H' // フィードバック月額
      : 'price_1OIiMRKUVUnt8GtyttXJ71Hz' // フィードバック3ヶ月
  }
  
  // デフォルトとしてスタンダード月額を返す
  return 'price_1OIiOUKUVUnt8GtyOfXEoEvW'; 
};

/**
 * プランの価格を取得する
 */
export const getPlanPrices = (): Record<PlanType, { monthly: number; quarterly: number }> => {
  return {
    free: { monthly: 0, quarterly: 0 },
    standard: { monthly: 2980, quarterly: 7590 }, // 3ヶ月は15%オフ（2980 * 3 * 0.85 = 7590）
    feedback: { monthly: 4980, quarterly: 12699 } // 3ヶ月は15%オフ（4980 * 3 * 0.85 = 12699）
  };
};

/**
 * 割引率を計算する（3ヶ月プランの場合）
 */
export const getQuarterlyDiscount = (): number => {
  return 15; // 15%割引
};

/**
 * プランの特徴を取得する
 */
export const getPlanFeatures = (): Record<PlanType, string[]> => {
  // 標準プランの特徴
  const standardFeatures = [
    '全ての学習コンテンツへのアクセス',
    'オンデマンド動画レッスン',
    'プログレストラッキング',
    '練習問題と小テスト',
    'コミュニティフォーラムへのアクセス'
  ];

  // フィードバックプランの特徴（標準プラン + α）
  const feedbackFeatures = [
    ...standardFeatures,
    '個別フィードバック（月3回まで）',
    '課題の添削',
    '質問への優先回答',
    '月1回のグループQ&Aセッション'
  ];

  return {
    free: ['無料コンテンツへのアクセス', 'サンプルレッスン', 'コミュニティフォーラムの閲覧'],
    standard: standardFeatures,
    feedback: feedbackFeatures
  };
};

/**
 * プランの説明を取得する
 */
export const getPlanDescriptions = (): Record<PlanType, string> => {
  return {
    free: '基本的な機能を試せる無料プラン',
    standard: '基本的な学習コンテンツにアクセスできるプラン',
    feedback: '個別フィードバックを受けられるプレミアムプラン'
  };
};
