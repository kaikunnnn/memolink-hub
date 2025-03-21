
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import NavbarLinks from '@/components/NavbarLinks';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="font-bold text-xl">
              学習プラットフォーム
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            <NavbarLinks />
          </div>

          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {isOpen && isMobile && (
        <div className="container border-t py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <NavbarLinks onMobileMenuClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
