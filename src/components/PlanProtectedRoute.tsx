
import React from 'react';
import { Navigate } from 'react-router-dom';
import { PlanType } from '@/types/subscription';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { toast } from 'sonner';

interface PlanProtectedRouteProps {
  /**
   * アクセスに必要なプラン
   */
  requiredPlan: PlanType;
  /**
   * 制限時のリダイレクト先
   */
  redirectTo?: string;
  /**
   * 子要素（アクセス権がある場合に表示される）
   */
  children: React.ReactNode;
}

/**
 * プラン制限付きルートコンポーネント
 */
const PlanProtectedRoute: React.FC<PlanProtectedRouteProps> = ({
  requiredPlan,
  redirectTo = '/pricing',
  children
}) => {
  const { hasAccess, isSubscribed } = usePlanAccess(requiredPlan);
  
  // アクセス権がなければリダイレクト
  if (!hasAccess) {
    // メッセージを表示
    if (isSubscribed) {
      toast.error(`この機能を利用するには、プランのアップグレードが必要です。`);
    } else {
      toast.info(`この機能を利用するには、サブスクリプションへの登録が必要です。`);
    }
    
    // リダイレクト
    return <Navigate to={redirectTo} replace />;
  }
  
  // アクセス権があれば表示
  return <>{children}</>;
};

export default PlanProtectedRoute;
