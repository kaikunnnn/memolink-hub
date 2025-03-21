
import { PlanType, BillingPeriod, PlanInfo } from '@/types/subscription';

// プラン情報のデータ
const PLAN_DATA: Record<PlanType, PlanInfo> = {
  free: {
    id: 'free',
    name: '無料プラン',
    description: '基本的な機能を無料で利用できます',
    features: [
      '基本的なコンテンツの閲覧',
      '限定コミュニティへのアクセス',
      'ブログ記事の閲覧'
    ],
    prices: {
      monthly: 0,
      quarterly: 0
    }
  },
  standard: {
    id: 'standard',
    name: 'スタンダードプラン',
    description: '基本的な学習コンテンツにアクセスできます',
    features: [
      '全ての学習コンテンツへのアクセス',
      '限定教材のダウンロード',
      '動画コンテンツの視聴',
      '練習問題と確認テスト',
      'モバイル・デスクトップ対応'
    ],
    prices: {
      monthly: 6400,
      quarterly: Math.round(6400 * 3 * 0.85) // 15%割引
    }
  },
  feedback: {
    id: 'feedback',
    name: 'フィードバックプラン',
    description: '個別フィードバックとレビューが受けられます',
    features: [
      '全ての学習コンテンツへのアクセス',
      '限定教材のダウンロード',
      '動画コンテンツの視聴',
      '練習問題と確認テスト',
      'モバイル・デスクトップ対応',
      '個別フィードバック',
      '週1回の質問対応',
      '添削サービス',
      'プロジェクトレビュー'
    ],
    prices: {
      monthly: 32000,
      quarterly: Math.round(32000 * 3 * 0.85) // 15%割引
    }
  }
};

// プラン情報を取得する関数
export function getPlanInfo(planType: PlanType): PlanInfo {
  return PLAN_DATA[planType];
}

// すべてのプラン情報を取得する関数
export function getAllPlans(): PlanInfo[] {
  return Object.values(PLAN_DATA);
}

// 価格を日本円形式でフォーマットする関数
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

// 月額表示価格を計算（3ヶ月の場合は月あたりの金額）
export function getMonthlyDisplayPrice(planType: PlanType, billingPeriod: BillingPeriod): string {
  const planInfo = getPlanInfo(planType);
  if (billingPeriod === 'monthly') {
    return formatPrice(planInfo.prices.monthly);
  } else {
    // 3ヶ月分の総額を3で割って月額相当を計算
    const monthlyEquivalent = Math.round(planInfo.prices.quarterly / 3);
    return formatPrice(monthlyEquivalent);
  }
}

// 期間表示名を取得
export function getPeriodDisplayName(billingPeriod: BillingPeriod): string {
  return billingPeriod === 'monthly' ? '月額' : '3ヶ月';
}

// サブスクリプションの日付をフォーマット
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// プラン名表示用のマッピング
export const planDisplayNames: Record<PlanType, string> = {
  free: '無料プラン',
  standard: 'スタンダードプラン',
  feedback: 'フィードバックプラン'
};

// 期間表示用のマッピング
export const periodDisplayNames: Record<BillingPeriod | 'null', string> = {
  monthly: '月額',
  quarterly: '3ヶ月',
  'null': ''
};

// ステータス表示用のマッピング
export const statusDisplayInfo: Record<string, { label: string, color: string }> = {
  active: { label: '有効', color: 'success' },
  canceled: { label: 'キャンセル済み（期間終了まで有効）', color: 'warning' },
  past_due: { label: '支払い期限超過', color: 'destructive' },
  incomplete: { label: '処理中', color: 'secondary' },
  trialing: { label: 'トライアル中', color: 'secondary' }
};
