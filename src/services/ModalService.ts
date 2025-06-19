export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'alert';
}

export interface ModalState {
  isOpen: boolean;
  options: ModalOptions | null;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

export class ModalService {
  private static instance: ModalService;
  private state: ModalState = {
    isOpen: false,
    options: null,
    onConfirm: null,
    onCancel: null
  };
  private listeners: Set<(state: ModalState) => void> = new Set();

  private constructor() {}

  static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  get currentState(): ModalState {
    return { ...this.state };
  }

  confirm(options: ModalOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state = {
        isOpen: true,
        options: {
          ...options,
          type: 'confirm',
          confirmText: options.confirmText || 'Підтвердити',
          cancelText: options.cancelText || 'Скасувати'
        },
        onConfirm: () => {
          this.close();
          resolve(true);
        },
        onCancel: () => {
          this.close();
          resolve(false);
        }
      };
      this.notifyListeners();
    });
  }

  alert(options: Omit<ModalOptions, 'type'>): Promise<void> {
    return new Promise((resolve) => {
      this.state = {
        isOpen: true,
        options: {
          ...options,
          type: 'alert',
          confirmText: options.confirmText || 'OK'
        },
        onConfirm: () => {
          this.close();
          resolve();
        },
        onCancel: null
      };
      this.notifyListeners();
    });
  }

  close(): void {
    this.state = {
      isOpen: false,
      options: null,
      onConfirm: null,
      onCancel: null
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: ModalState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentState));
  }
} 