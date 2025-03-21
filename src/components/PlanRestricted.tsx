
import React from 'react';
import { PlanType } from '@/types/subscription';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { planDisplayNames } from '@/utils/subscription';
import { Lock } from 'lucide-react';

interface PlanRestrictedProps {
  /**
   * 表示に必要なプラン
   */
  requiredPlan: PlanType;
  /**
   * プラン制限時に表示するメッセージ
   */
  message?: string;
  /**
   * ロック表示の代わりに完全に非表示にする場合はtrue
   */
  hideCompletely?: boolean;
  /**
   * 子要素（アクセス権がある場合に表示される）
   */
  children: React.ReactNode;
}

/**
 * プラン制限付きコンテンツを表示するコンポーネント
 */
const PlanRestricted: React.FC<PlanRestrictedProps> = ({
  requiredPlan,
  message,
  hideCompletely = false,
  children
}) => {
  const { hasAccess, currentPlan } = usePlanAccess(requiredPlan);
  const navigate = useNavigate();
  
  // アクセス権がある場合は通常表示
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // 完全に非表示にする場合
  if (hideCompletely) {
    return null;
  }

  // デフォルトメッセージ
  const defaultMessage = `この機能は${planDisplayNames[requiredPlan]}以上でご利用いただけます`;
  
  // ロック表示
  return (
    <div className="relative border rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
        <div className="bg-muted/90 p-6 rounded-lg max-w-md text-center shadow-lg">
          <Lock className="mx-auto h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold mb-2">プレミアムコンテンツ</h3>
          <p className="mb-4 text-muted-foreground">
            {message || defaultMessage}
          </p>
          <Button onClick={() => navigate('/pricing')} className="w-full">
            プランをアップグレード
          </Button>
        </div>
      </div>
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default PlanRestricted;
