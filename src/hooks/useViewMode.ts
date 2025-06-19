'use client';

import { useEffect, useState, useCallback } from 'react';
import { ViewModeService, ViewMode, ViewModeState } from '../services/ViewModeService';

export function useViewMode() {
  const [viewModeStates, setViewModeStates] = useState<ViewModeState[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const viewModeService = ViewModeService.getInstance();

  useEffect(() => {
    const updateState = (states: ViewModeState[]) => {
      setViewModeStates(states);
      setActiveOverlay(viewModeService.activeOverlay);
    };

    const unsubscribe = viewModeService.subscribe(updateState);
    updateState(viewModeService.currentStates);

    return unsubscribe;
  }, [viewModeService]);

  const getViewMode = useCallback((listId: string): ViewMode => {
    return viewModeService.getViewMode(listId);
  }, [viewModeService]);

  const setViewMode = useCallback((listId: string, mode: ViewMode) => {
    viewModeService.setViewMode(listId, mode);
  }, [viewModeService]);

  const toggleViewMode = useCallback((listId: string) => {
    viewModeService.toggleViewMode(listId);
  }, [viewModeService]);

  const transitionToLarge = useCallback((listId: string) => {
    viewModeService.transitionToLarge(listId);
  }, [viewModeService]);

  const closeOverlay = useCallback(() => {
    viewModeService.closeOverlay();
  }, [viewModeService]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && activeOverlay) {
      closeOverlay();
    }
  }, [activeOverlay, closeOverlay]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  return {
    viewModeStates,
    activeOverlay,
    getViewMode,
    setViewMode,
    toggleViewMode,
    transitionToLarge,
    closeOverlay
  };
} 