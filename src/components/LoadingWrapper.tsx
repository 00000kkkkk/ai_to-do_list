'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { useLoading } from '../hooks/useLoading';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export const LoadingWrapper = ({ children }: LoadingWrapperProps) => {
  const { isLoading } = useLoading();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  if (!isClient) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <>
      {showLoadingScreen && (
        <LoadingScreen 
          isVisible={isLoading} 
          onComplete={handleLoadingComplete}
        />
      )}
      <div 
        className={`transition-opacity duration-500 ${
          showLoadingScreen && isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        suppressHydrationWarning
      >
        {children}
      </div>
    </>
  );
}; 