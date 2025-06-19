export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: Theme = Theme.SYSTEM;
  private listeners: Set<(theme: Theme) => void> = new Set();
  private mediaQuery?: MediaQueryList;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
      this.loadTheme();
      this.applyTheme();
    }
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && Object.values(Theme).includes(savedTheme)) {
        this.currentTheme = savedTheme;
      }
    } catch {
    }
  }

  private saveTheme(): void {
    try {
      localStorage.setItem('theme', this.currentTheme);
    } catch {
    }
  }

  private handleSystemThemeChange(): void {
    if (this.currentTheme === Theme.SYSTEM) {
      this.applyTheme();
      this.notifyListeners();
    }
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = this.getEffectiveTheme() === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === Theme.SYSTEM) {
      return this.mediaQuery?.matches ? 'dark' : 'light';
    }
    return this.currentTheme === Theme.DARK ? 'dark' : 'light';
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public getEffectiveThemePublic(): 'light' | 'dark' {
    return this.getEffectiveTheme();
  }

  public setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  public toggleTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    this.setTheme(effectiveTheme === 'dark' ? Theme.LIGHT : Theme.DARK);
  }

  public subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getThemeIcon(): string {
    const effectiveTheme = this.getEffectiveTheme();
    return effectiveTheme === 'dark' ? '☀️' : '🌙';
  }

  public getThemeLabel(): string {
    const effectiveTheme = this.getEffectiveTheme();
    return effectiveTheme === 'dark' ? 'Світла тема' : 'Темна тема';
  }
}

export const themeService = ThemeService.getInstance(); 