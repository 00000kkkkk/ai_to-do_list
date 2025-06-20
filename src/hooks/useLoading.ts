'use client';

import { useState, useEffect } from 'react';
import { LoadingService } from '../services/LoadingService';

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingService] = useState(() => LoadingService.getInstance());

  useEffect(() => {
    const unsubscribe = loadingService.addListener(setIsLoading);
    return unsubscribe;
  }, [loadingService]);

  const forceFinish = () => {
    loadingService.forceFinish();
  };

  return {
    isLoading,
    forceFinish
  };
}; 