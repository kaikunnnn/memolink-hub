
import { useSubscription } from '@/hooks/useSubscription';
import { PlanType } from '@/types/subscription';

/**
 * プラン別のアクセス制御を行うカスタムフック
 * @param requiredPlan 必要なプランレベル（'standard' | 'feedback'）
 * @returns アクセス可能かどうかのブール値と現在のプラン情報
 */
export const usePlanAccess = (requiredPlan?: PlanType) => {
  const { subscription } = useSubscription();
  
  const currentPlan = subscription?.planType || 'free';
  
  // プランのアクセスレベルを数値化
  const planLevels: Record<PlanType, number> = {
    free: 0,
    standard: 1,
    feedback: 2
  };
  
  // 現在のプランが必要なプランレベル以上かをチェック
  const hasAccess = requiredPlan 
    ? planLevels[currentPlan] >= planLevels[requiredPlan] 
    : true;
  
  return {
    hasAccess,
    currentPlan,
    isSubscribed: !!subscription,
    subscription
  };
};

export default usePlanAccess;
