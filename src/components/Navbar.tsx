
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, User } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Replace with actual auth state
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // TODO: Replace with actual auth check
  useEffect(() => {
    // For now, we'll simulate auth status
    // In reality, this would check Supabase auth status
    setIsLoggedIn(location.pathname === '/account');
  }, [location.pathname]);
  
  const navItems = [
    { name: 'ホーム', path: '/' },
    { name: 'コース', path: '/courses' },
    { name: '料金プラン', path: '/pricing' },
    { name: '講師紹介', path: '/instructors' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
        isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container-wide flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="font-bold text-xl md:text-2xl tracking-tight mr-8"
          >
            MemoLearn
          </Link>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <Button variant="ghost" size="sm" onClick={() => navigate('/account')}>
              <User className="mr-2 h-4 w-4" />
              マイアカウント
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/signin">サインイン</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">無料で始める <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </>
          )}
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 -mr-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-secondary"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          mobileMenuOpen 
            ? 'max-h-screen bg-background border-b' 
            : 'max-h-0'
        )}
      >
        <div className="container-wide py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
                isActive(item.path)
                  ? 'text-primary bg-primary/5'
                  : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 space-y-2">
            {isLoggedIn ? (
              <Button className="w-full" asChild>
                <Link to="/account">マイアカウント</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/signin">サインイン</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/signup">無料で始める</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
