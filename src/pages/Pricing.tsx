
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
import { 
  getPlanPrices, 
  getQuarterlyDiscount, 
  getPlanFeatures, 
  getPlanDescriptions 
} from '@/utils/subscription';

const Pricing = () => {
  const { user } = useAuth();
  const { subscription, createSubscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<BillingPeriod>('monthly');

  // プラン価格とフィーチャーを取得
  const planPrices = getPlanPrices();
  const planFeatures = getPlanFeatures();
  const planDescriptions = getPlanDescriptions();

  // 支払いサイクルに基づいて価格を計算
  const getPriceDisplay = (planType: PlanType): string => {
    const basePrice = planPrices[planType][selectedBillingPeriod];
    return `¥${basePrice.toLocaleString()}`;
  };

  // 期間の表示テキスト
  const periodText = selectedBillingPeriod === 'monthly' ? '月額' : '3ヶ月';
  
  // 割引表示テキスト（3ヶ月プランの場合）
  const discountText = selectedBillingPeriod === 'quarterly' 
    ? `${getQuarterlyDiscount()}%お得` 
    : '';

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
              {discountText && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {discountText}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* スタンダードプラン */}
        <MembershipTier
          title="スタンダードプラン"
          description={planDescriptions.standard}
          price={getPriceDisplay('standard')}
          period={periodText}
          features={planFeatures.standard}
          buttonText={subscription ? 'アカウント管理' : 'スタンダードプランに登録'}
          onClick={subscription ? handleExistingSubscription : () => handleSelectPlan('standard')}
          buttonVariant={subscription ? 'outline' : 'default'}
        />

        {/* フィードバックプラン */}
        <MembershipTier
          title="フィードバックプラン"
          description={planDescriptions.feedback}
          price={getPriceDisplay('feedback')}
          period={periodText}
          features={planFeatures.feedback}
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
