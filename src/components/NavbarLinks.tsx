
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, BookOpen, UserRound, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';

const NavbarLinks = () => {
  const { user } = useAuth();
  const { isSubscribed, currentPlan } = usePlanAccess();

  return (
    <div className="flex items-center gap-2">
      <Link to="/courses">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <BookOpen className="h-4 w-4 mr-2" />
          コース
        </Button>
      </Link>
      
      <Link to="/premium">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <Crown className="h-4 w-4 mr-2" />
          プレミアム
          {isSubscribed && currentPlan !== 'free' && (
            <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {currentPlan === 'feedback' ? 'FB' : 'STD'}
            </span>
          )}
        </Button>
      </Link>

      <Link to="/pricing">
        <Button variant="ghost" size="sm" className="hidden md:flex">
          <CreditCard className="h-4 w-4 mr-2" />
          料金プラン
        </Button>
      </Link>
      
      {user ? (
        <Link to="/account">
          <Button variant="ghost" size="sm">
            <UserRound className="h-4 w-4 mr-2" />
            アカウント
          </Button>
        </Link>
      ) : (
        <Link to="/login">
          <Button size="sm">ログイン</Button>
        </Link>
      )}
    </div>
  );
};

export default NavbarLinks;
