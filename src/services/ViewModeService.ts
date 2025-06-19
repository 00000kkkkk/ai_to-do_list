export enum ViewMode {
  COMPACT = 'compact',
  MEDIUM = 'medium', 
  LARGE = 'large'
}

export interface ViewModeState {
  listId: string;
  mode: ViewMode;
  position?: { x: number; y: number };
}

export class ViewModeService {
  private static instance: ViewModeService;
  private viewModes: Map<string, ViewMode>;
  private activeOverlayListId: string | null = null;
  private listeners: Set<(state: ViewModeState[]) => void> = new Set();
  private isInitialized = false;

  private constructor() {
    this.viewModes = new Map();
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.isInitialized = true;
    }
  }

  static getInstance(): ViewModeService {
    if (!ViewModeService.instance) {
      ViewModeService.instance = new ViewModeService();
    }
    return ViewModeService.instance;
  }

  get currentStates(): ViewModeState[] {
    this.ensureInitialized();
    return Array.from(this.viewModes.entries()).map(([listId, mode]) => ({
      listId,
      mode
    }));
  }

  get activeOverlay(): string | null {
    return this.activeOverlayListId;
  }

  set activeOverlay(listId: string | null) {
    this.activeOverlayListId = listId;
    this.notifyListeners();
  }

  getViewMode(listId: string): ViewMode {
    this.ensureInitialized();
    return this.viewModes.get(listId) || ViewMode.COMPACT;
  }

  setViewMode(listId: string, mode: ViewMode): void {
    this.ensureInitialized();
    
    if (mode === ViewMode.COMPACT) {
      this.activeOverlayListId = null;
    } else {
      this.activeOverlayListId = listId;
    }

    this.viewModes.set(listId, mode);
    this.saveToStorage();
    this.notifyListeners();

    this.logTransition();
  }

  toggleViewMode(listId: string): void {
    const currentMode = this.getViewMode(listId);
    let nextMode: ViewMode;

    switch (currentMode) {
      case ViewMode.COMPACT:
        nextMode = ViewMode.MEDIUM;
        break;
      case ViewMode.MEDIUM:
        nextMode = ViewMode.LARGE;
        break;
      case ViewMode.LARGE:
        nextMode = ViewMode.COMPACT;
        break;
      default:
        nextMode = ViewMode.COMPACT;
    }

    this.setViewMode(listId, nextMode);
  }

  transitionToLarge(listId: string): void {
    const currentMode = this.getViewMode(listId);
    if (currentMode === ViewMode.MEDIUM) {
      this.setViewMode(listId, ViewMode.LARGE);
    }
  }

  closeOverlay(): void {
    if (this.activeOverlayListId) {
      this.setViewMode(this.activeOverlayListId, ViewMode.COMPACT);
    }
  }

  subscribe(listener: (state: ViewModeState[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.currentStates;
    this.listeners.forEach(listener => listener(state));
  }

  private ensureInitialized(): void {
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.loadFromStorage();
      this.isInitialized = true;
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Array.from(this.viewModes.entries());
      localStorage.setItem('todoListViewModes', JSON.stringify(data));
    } catch {
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('todoListViewModes');
      if (stored) {
        const data = JSON.parse(stored) as [string, ViewMode][];
        this.viewModes = new Map(data);
      }
    } catch {
    }
  }

  private logTransition(): void {
  }

  reset(): void {
    this.ensureInitialized();
    this.viewModes.clear();
    this.activeOverlayListId = null;
    this.saveToStorage();
    this.notifyListeners();
  }
} 