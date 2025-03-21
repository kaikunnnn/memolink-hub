
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { BillingPeriod, PlanType } from '@/types/subscription';
import MembershipTier from '@/components/MembershipTier';
import { toast } from 'sonner';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createSubscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<BillingPeriod>('monthly');

  // 支払いサイクルに基づいて価格を計算
  const getPriceDisplay = (basePrice: number): string => {
    if (selectedBillingPeriod === 'quarterly') {
      // 四半期プランは15%割引
      const discountedPrice = basePrice * 3 * 0.85;
      return `¥${Math.floor(discountedPrice).toLocaleString()}`;
    }
    return `¥${basePrice.toLocaleString()}`;
  };

  // 期間の表示テキスト
  const periodText = selectedBillingPeriod === 'monthly' ? '月額' : '3ヶ月';

  // プランの選択処理
  const handleSelectPlan = async (planType: PlanType) => {
    if (!user) {
      toast.info('サブスクリプションを購入するにはログインが必要です');
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    try {
      await createSubscription({
        planType,
        billingPeriod: selectedBillingPeriod
      });
    } catch (error) {
      console.error('サブスクリプション作成エラー:', error);
    }
  };

  // すでに購読中の場合はアカウントページへ
  const handleExistingSubscription = () => {
    navigate('/account');
    toast.info('サブスクリプション管理はアカウントページから行えます');
  };

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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">シンプルでわかりやすい料金体系</h1>
        <p className="text-xl text-muted-foreground">
          あなたの学習スタイルに合わせて、最適なプランをお選びください
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs 
          defaultValue="monthly" 
          value={selectedBillingPeriod}
          onValueChange={(value) => setSelectedBillingPeriod(value as BillingPeriod)}
          className="w-full max-w-md"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="monthly">月額プラン</TabsTrigger>
            <TabsTrigger value="quarterly">
              3ヶ月プラン 
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                15%お得
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* スタンダードプラン */}
        <MembershipTier
          title="スタンダードプラン"
          description="基本的な学習コンテンツにアクセスできるプラン"
          price={getPriceDisplay(2980)}
          period={periodText}
          features={standardFeatures}
          buttonText={subscription ? 'アカウント管理' : 'スタンダードプランに登録'}
          onClick={subscription ? handleExistingSubscription : () => handleSelectPlan('standard')}
          buttonVariant={subscription ? 'outline' : 'default'}
        />

        {/* フィードバックプラン */}
        <MembershipTier
          title="フィードバックプラン"
          description="個別フィードバックを受けられるプレミアムプラン"
          price={getPriceDisplay(4980)}
          period={periodText}
          features={feedbackFeatures}
          isPopular={true}
          buttonText={subscription ? 'アカウント管理' : 'フィードバックプランに登録'}
          onClick={subscription ? handleExistingSubscription : () => handleSelectPlan('feedback')}
          buttonVariant={subscription ? 'outline' : 'default'}
        />
      </div>

      <div className="mt-12 max-w-2xl mx-auto p-6 bg-muted rounded-xl">
        <h3 className="text-xl font-semibold mb-4">よくある質問</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">サブスクリプションはいつでもキャンセルできますか？</h4>
            <p className="text-muted-foreground">はい、いつでもキャンセル可能です。キャンセル後も支払い期間の終了まではサービスをご利用いただけます。</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">プランの変更はできますか？</h4>
            <p className="text-muted-foreground">はい、アカウントページからいつでもプランを変更できます。アップグレードは即時反映され、ダウングレードは次の請求期間から適用されます。</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">支払い方法は何がありますか？</h4>
            <p className="text-muted-foreground">クレジットカード（Visa、Mastercard、American Express）でのお支払いに対応しています。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
