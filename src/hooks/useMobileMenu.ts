'use client';

import { createContext, useContext } from 'react';

interface MobileMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  openMenu: () => void;
  isMobile: boolean;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    return {
      isOpen: false,
      setIsOpen: () => {},
      toggleMenu: () => {},
      closeMenu: () => {},
      openMenu: () => {},
      isMobile: false
    };
  }
  return context;
}

export { MobileMenuContext }; 