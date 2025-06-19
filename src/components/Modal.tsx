'use client';

import { useEffect, useState } from 'react';
import { ModalService, ModalState } from '../services/ModalService';

export function Modal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    options: null,
    onConfirm: null,
    onCancel: null
  });

  useEffect(() => {
    const modalService = ModalService.getInstance();
    const unsubscribe = modalService.subscribe(setModalState);
    
    return unsubscribe;
  }, []);

  if (!modalState.isOpen || !modalState.options) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modalState.onCancel) {
      modalState.onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-neutral-100 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform scale-100 transition-all duration-300">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-700 mb-3 sm:mb-4">
          {modalState.options.title}
        </h2>
        
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-600 mb-6 sm:mb-8">
          {modalState.options.message}
        </p>
        
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          {modalState.options.type === 'confirm' && modalState.onCancel && (
            <button
              onClick={modalState.onCancel}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-100 dark:bg-neutral-200 text-neutral-700 dark:text-neutral-600 font-medium rounded-lg sm:rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-300 transition-all duration-200 text-sm sm:text-base"
            >
              {modalState.options.cancelText}
            </button>
          )}
          
          {modalState.onConfirm && (
            <button
              onClick={modalState.onConfirm}
              className="floating-button px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {modalState.options.confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 