
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';

interface NavbarLinksProps {
  onMobileMenuClick?: () => void;
}

const NavbarLinks = ({ onMobileMenuClick }: NavbarLinksProps = {}) => {
  const { user } = useAuth();
  const { hasAccess } = usePlanAccess();

  const handleClick = () => {
    if (onMobileMenuClick) {
      onMobileMenuClick();
    }
  };

  return (
    <>
      <Link to="/courses" className="px-3 py-2" onClick={handleClick}>
        コース
      </Link>

      <Link to="/premium" className="px-3 py-2" onClick={handleClick}>
        プレミアム
      </Link>

      <Link to="/pricing" className="px-3 py-2" onClick={handleClick}>
        料金プラン
      </Link>
      
      {user ? (
        <Link to="/account" className="px-3 py-2" onClick={handleClick}>
          アカウント
        </Link>
      ) : (
        <Link to="/login" className="px-3 py-2" onClick={handleClick}>
          ログイン
        </Link>
      )}
    </>
  );
};

export default NavbarLinks;
