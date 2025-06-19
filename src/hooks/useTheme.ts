'use client';

import { useState, useEffect } from 'react';
import { ThemeService, Theme } from '../services/ThemeService';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(Theme.SYSTEM);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const themeService = ThemeService.getInstance();
    
    setCurrentTheme(themeService.getCurrentTheme());
    setEffectiveTheme(themeService.getEffectiveThemePublic());
    setIsLoading(false);

    const unsubscribe = themeService.subscribe((theme) => {
      setCurrentTheme(theme);
      setEffectiveTheme(themeService.getEffectiveThemePublic());
    });

    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    const themeService = ThemeService.getInstance();
    themeService.toggleTheme();
  };

  const setTheme = (theme: Theme) => {
    const themeService = ThemeService.getInstance();
    themeService.setTheme(theme);
  };

  const getThemeIcon = () => {
    const themeService = ThemeService.getInstance();
    return themeService.getThemeIcon();
  };

  const getThemeLabel = () => {
    const themeService = ThemeService.getInstance();
    return themeService.getThemeLabel();
  };

  return {
    currentTheme,
    effectiveTheme,
    isLoading,
    isClient,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    toggleTheme,
    setTheme,
    getThemeIcon,
    getThemeLabel
  };
} 