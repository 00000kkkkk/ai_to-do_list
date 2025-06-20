export class LoadingService {
  private static instance: LoadingService;
  private listeners: ((isLoading: boolean) => void)[] = [];
  private _isLoading: boolean = true;
  private minimumLoadTime: number = 2500;
  private startTime: number;
  private initialized: boolean = false;

  private constructor() {
    this.startTime = typeof window !== 'undefined' ? Date.now() : 0;
    if (typeof window !== 'undefined') {
      this.initializeLoading();
    }
  }

  public static getInstance(): LoadingService {
    if (!LoadingService.instance) {
      LoadingService.instance = new LoadingService();
    }
    return LoadingService.instance;
  }

  private async initializeLoading(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    
    const hasVisited = this.getVisitedFlag();
    
    if (hasVisited) {
      this.minimumLoadTime = 1000;
    }

    await this.simulateInitialLoad();
    this.finishLoading();
  }

  private async simulateInitialLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }
      
      const elapsed = Date.now() - this.startTime;
      const remaining = Math.max(0, this.minimumLoadTime - elapsed);
      
      setTimeout(resolve, remaining);
    });
  }

  private finishLoading(): void {
    this._isLoading = false;
    this.setVisitedFlag();
    this.notifyListeners();
  }

  private getVisitedFlag(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('ai-todo-visited') === 'true';
    } catch {
      return false;
    }
  }

  private setVisitedFlag(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('ai-todo-visited', 'true');
    } catch {
    }
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public addListener(callback: (isLoading: boolean) => void): () => void {
    this.listeners.push(callback);
    
    if (typeof window !== 'undefined' && !this.initialized) {
      this.startTime = Date.now();
      this.initializeLoading();
    }
    
    callback(this._isLoading);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this._isLoading));
  }

  public forceFinish(): void {
    if (this._isLoading) {
      this.finishLoading();
    }
  }
} 