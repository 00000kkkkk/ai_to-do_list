'use client';

import { useState, useEffect } from 'react';
import { MobileMenuContext } from '../hooks/useMobileMenu';

interface MobileMenuProviderProps {
  children: React.ReactNode;
}

export function MobileMenuProvider({ children }: MobileMenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile && isOpen) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const openMenu = () => setIsOpen(true);

  return (
    <MobileMenuContext.Provider 
      value={{ 
        isOpen, 
        setIsOpen, 
        toggleMenu, 
        closeMenu, 
        openMenu, 
        isMobile 
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
} 