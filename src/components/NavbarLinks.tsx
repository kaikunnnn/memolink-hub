
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';

const NavbarLinks = () => {
  const { user } = useAuth();
  const { hasAccess } = usePlanAccess();

  return (
    <>
      <Link to="/courses" className="px-3 py-2">
        コース
      </Link>

      <Link to="/premium" className="px-3 py-2">
        プレミアム
      </Link>

      <Link to="/pricing" className="px-3 py-2">
        料金プラン
      </Link>
      
      {user ? (
        <Link to="/account" className="px-3 py-2">
          アカウント
        </Link>
      ) : (
        <Link to="/login" className="px-3 py-2">
          ログイン
        </Link>
      )}
    </>
  );
};

export default NavbarLinks;
