'use client';

import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useMobileMenu } from '../hooks/useMobileMenu';
import { useViewMode } from '../hooks/useViewMode';

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme, getThemeLabel, isClient } = useTheme();
  const { isOpen: isMobileMenuOpen, isMobile } = useMobileMenu();
  const { activeOverlay } = useViewMode();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    if (isAnimating || (isMobile && (isMobileMenuOpen || activeOverlay !== null))) return;
    
    setIsAnimating(true);
    toggleTheme();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsAnimating(false);
  };

  const isDisabled = isAnimating || (isMobile && (isMobileMenuOpen || activeOverlay !== null));
  const shouldHide = isMobile && (isMobileMenuOpen || activeOverlay !== null);

  if (!isClient) {
    return (
      <button
        className="relative p-3 rounded-xl transition-all duration-300 bg-white hover:bg-neutral-50 text-neutral-800 shadow-lg hover:shadow-xl border border-neutral-200 hover:scale-105 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-yellow-400 dark:border-neutral-300"
        disabled={true}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </button>
    );
  }

  if (shouldHide) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative p-3 rounded-xl transition-all duration-300 
        ${effectiveTheme === 'dark' 
          ? 'bg-neutral-100 hover:bg-neutral-200 text-yellow-400 border-neutral-300'
          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200'
        }
        shadow-lg hover:shadow-xl border
        ${isDisabled ? 'scale-95 opacity-50' : 'hover:scale-105'}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isDisabled && isMobile ? "Недоступно під час відкритого меню" : getThemeLabel()}
      disabled={isDisabled}
      suppressHydrationWarning
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 transform
            ${effectiveTheme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-180 scale-50'
            }
          `}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 transform
            ${effectiveTheme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-180 scale-50'
            }
          `}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
        </div>
      )}
    </button>
  );
} 