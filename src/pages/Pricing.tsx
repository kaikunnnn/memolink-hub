
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import MembershipTier from '@/components/MembershipTier';
import { Check } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // 3ヶ月プランの割引価格計算（15%割引）
  const standardMonthlyPrice = 6400;
  const standardQuarterlyPrice = Math.round(standardMonthlyPrice * 3 * 0.85);
  const standardQuarterlyMonthly = Math.round(standardQuarterlyPrice / 3);
  
  const feedbackMonthlyPrice = 32000;
  const feedbackQuarterlyPrice = Math.round(feedbackMonthlyPrice * 3 * 0.85);
  const feedbackQuarterlyMonthly = Math.round(feedbackQuarterlyPrice / 3);

  // 機能リスト
  const standardFeatures = [
    "全ての学習コンテンツへのアクセス",
    "限定教材のダウンロード",
    "動画コンテンツの視聴",
    "練習問題と確認テスト",
    "モバイル・デスクトップ対応",
  ];

  const feedbackFeatures = [
    "全ての学習コンテンツへのアクセス",
    "限定教材のダウンロード",
    "動画コンテンツの視聴",
    "練習問題と確認テスト",
    "モバイル・デスクトップ対応",
    "個別フィードバック",
    "週1回の質問対応",
    "添削サービス",
    "プロジェクトレビュー",
  ];

  // サブスクリプション処理
  const handleSubscribe = async (planType: 'standard' | 'feedback', period: 'monthly' | 'quarterly') => {
    if (!user) {
      toast("サブスクリプションを開始するにはログインが必要です");
      navigate('/signin', { state: { returnUrl: '/pricing' } });
      return;
    }

    // プラン情報を構築
    let planId;
    if (planType === 'standard') {
      planId = period === 'monthly' ? 'standard_monthly' : 'standard_quarterly';
    } else {
      planId = period === 'monthly' ? 'feedback_monthly' : 'feedback_quarterly';
    }

    try {
      toast("サブスクリプション処理を開始します...");
      // 実際にはここでチェックアウトセッションを作成するためのAPIを呼び出すコードが入ります
      // 現在はモックとして、直接アカウントページに遷移します
      navigate('/account');
    } catch (error) {
      console.error('サブスクリプション処理エラー:', error);
      toast.error("サブスクリプション処理中にエラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 md:pt-24">
        <section className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">料金プラン</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              あなたの学習スタイルに合わせた柔軟なプランをご用意しています。
              いつでもプランの変更が可能です。
            </p>
          </div>

          {/* 支払い期間の切り替えボタン */}
          <div className="flex justify-center mb-12">
            <ToggleGroup 
              type="single" 
              value={billingPeriod}
              onValueChange={(value) => {
                if (value) setBillingPeriod(value as 'monthly' | 'quarterly');
              }}
              className="inline-flex bg-secondary rounded-lg p-1"
            >
              <ToggleGroupItem value="monthly" className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                月額
              </ToggleGroupItem>
              <ToggleGroupItem value="quarterly" className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                3ヶ月
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* プラン表示 - 条件付きレンダリングで月額/3ヶ月プランを切り替え */}
          {billingPeriod === 'monthly' ? (
            // 月額プラン
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <MembershipTier
                title="スタンダードプラン（月額）"
                price={`¥${standardMonthlyPrice.toLocaleString()}`}
                period="月"
                description="基本的な学習コンテンツにアクセスできます"
                features={standardFeatures}
                buttonText="今すぐ登録"
                onClick={() => handleSubscribe('standard', 'monthly')}
              />
              
              <MembershipTier
                title="フィードバックプラン（月額）"
                price={`¥${feedbackMonthlyPrice.toLocaleString()}`}
                period="月"
                description="個別フィードバックとレビューが受けられます"
                features={feedbackFeatures}
                isPopular={true}
                buttonText="今すぐ登録"
                onClick={() => handleSubscribe('feedback', 'monthly')}
              />
            </div>
          ) : (
            // 3ヶ月プラン
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <MembershipTier
                title="スタンダードプラン（3ヶ月）"
                price={`¥${standardQuarterlyMonthly.toLocaleString()}`}
                period="月（一括払い）"
                description={`3ヶ月一括払い ¥${standardQuarterlyPrice.toLocaleString()}（月々の場合と比べて¥${(standardMonthlyPrice * 3 - standardQuarterlyPrice).toLocaleString()}お得）`}
                features={standardFeatures}
                buttonText="今すぐ登録"
                onClick={() => handleSubscribe('standard', 'quarterly')}
              />
              
              <MembershipTier
                title="フィードバックプラン（3ヶ月）"
                price={`¥${feedbackQuarterlyMonthly.toLocaleString()}`}
                period="月（一括払い）"
                description={`3ヶ月一括払い ¥${feedbackQuarterlyPrice.toLocaleString()}（月々の場合と比べて¥${(feedbackMonthlyPrice * 3 - feedbackQuarterlyPrice).toLocaleString()}お得）`}
                features={feedbackFeatures}
                isPopular={true}
                buttonText="今すぐ登録"
                onClick={() => handleSubscribe('feedback', 'quarterly')}
              />
            </div>
          )}
        </section>

        {/* FAQ セクション */}
        <section className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">よくある質問</h2>
          
          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">サブスクリプションはいつでもキャンセルできますか？</h3>
              <p className="text-muted-foreground">はい、サブスクリプションはいつでもキャンセルできます。キャンセル後も、支払い済み期間の終了まではサービスをご利用いただけます。</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">プランを途中で変更することはできますか？</h3>
              <p className="text-muted-foreground">はい、いつでもプランを変更することができます。アップグレードの場合は即時反映され、ダウングレードの場合は次の請求サイクルから適用されます。</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">支払い方法は何がありますか？</h3>
              <p className="text-muted-foreground">クレジットカード（Visa、Mastercard、American Express）でのお支払いに対応しています。</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">返金ポリシーはありますか？</h3>
              <p className="text-muted-foreground">サブスクリプション開始から14日以内であれば、全額返金いたします。詳細についてはカスタマーサポートまでお問い合わせください。</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingPage;
