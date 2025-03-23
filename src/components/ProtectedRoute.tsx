
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isPending, isConfigured } = useAuth(); // isLoadingをisPendingに変更
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !isConfigured) {
      // If Supabase is not configured, we don't redirect
      return;
    }
    
    if (!isPending && !user && isConfigured) {
      navigate('/signin', { replace: true });
    }
  }, [user, isPending, isConfigured, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If Supabase is not configured, still render the children
  if (!isConfigured) {
    return <>{children}</>;
  }

  return user ? <>{children}</> : null;
};

export default ProtectedRoute;
