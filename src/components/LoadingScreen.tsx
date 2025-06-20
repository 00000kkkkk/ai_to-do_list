'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const LoadingScreen = ({ isVisible, onComplete }: LoadingScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'loading' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setAnimationPhase('exit');
      const timer = setTimeout(() => {
        onComplete?.();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  useEffect(() => {
    if (isVisible) {
      const enterTimer = setTimeout(() => {
        setAnimationPhase('loading');
      }, 300);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 12 + 3;
        });
      }, 120);

      return () => {
        clearTimeout(enterTimer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible]);

  if (!isVisible && animationPhase === 'enter') return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-600 ease-out ${
        animationPhase === 'exit' 
          ? 'opacity-0' 
          : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-100" />
      
      <div className={`absolute inset-0 overflow-hidden transition-all duration-800 ${
        animationPhase === 'enter' ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-400/40 dark:bg-primary-400/30 rounded-full loading-float" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary-400/40 dark:bg-secondary-400/30 rounded-full loading-float"
             style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute top-3/4 left-1/2 w-16 h-16 bg-accent-400/40 dark:bg-accent-400/30 rounded-full loading-float"
             style={{ animationDelay: '4s', animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 text-center px-8 max-w-sm mx-auto">
        <div className={`transition-all duration-800 ${
          animationPhase === 'enter' ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
        }`}>
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl opacity-20 loading-pulse" />
              <div className="absolute inset-0 border-2 border-primary-300 dark:border-primary-600 rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-primary-600 dark:bg-primary-500 rounded-sm loading-spinner opacity-80" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-800 dark:text-white mb-2">
            AI Todo Lists
          </h1>
          
          <p className="text-sm text-neutral-600 dark:text-white mb-8">
            Завантаження...
          </p>

          <div className="space-y-3">
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
                         <div className="text-xs text-neutral-500 dark:text-white">
               {Math.round(Math.min(progress, 100))}%
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 