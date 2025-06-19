export interface SwipeConfig {
  threshold: number;
  allowedTime: number;
  restraint: number;
}

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onMove?: (progress: number, direction: string) => void;
  onEnd?: () => void;
}

export class SwipeService {
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private element: HTMLElement | null = null;
  private callbacks: SwipeCallbacks = {};
  private config: SwipeConfig = {
    threshold: 100,
    allowedTime: 500,
    restraint: 100
  };
  private isSwiping: boolean = false;
  private boundHandlers: {
    handleTouchStart: (e: TouchEvent) => void;
    handleTouchMove: (e: TouchEvent) => void;
    handleTouchEnd: (e: TouchEvent) => void;
    handleTouchCancel: (e: TouchEvent) => void;
  };

  constructor() {
    this.boundHandlers = {
      handleTouchStart: this.handleTouchStart.bind(this),
      handleTouchMove: this.handleTouchMove.bind(this),
      handleTouchEnd: this.handleTouchEnd.bind(this),
      handleTouchCancel: this.handleTouchCancel.bind(this)
    };
  }

  static create(): SwipeService {
    return new SwipeService();
  }

  attach(element: HTMLElement, callbacks: SwipeCallbacks, config?: Partial<SwipeConfig>): void {
    this.element = element;
    this.callbacks = callbacks;
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.addEventListeners();
  }

  detach(): void {
    if (this.element) {
      this.removeEventListeners();
      this.element = null;
      this.callbacks = {};
    }
  }

  private addEventListeners(): void {
    if (!this.element) return;

    this.element.addEventListener('touchstart', this.boundHandlers.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.boundHandlers.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.boundHandlers.handleTouchEnd);
    this.element.addEventListener('touchcancel', this.boundHandlers.handleTouchCancel);
  }

  private removeEventListeners(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.boundHandlers.handleTouchStart);
    this.element.removeEventListener('touchmove', this.boundHandlers.handleTouchMove);
    this.element.removeEventListener('touchend', this.boundHandlers.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.boundHandlers.handleTouchCancel);
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.touchStartX = touch.pageX;
    this.touchStartY = touch.pageY;
    this.touchStartTime = Date.now();
    this.isSwiping = false;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = e.touches[0];
    const xDiff = touch.pageX - this.touchStartX;
    const yDiff = touch.pageY - this.touchStartY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (e.cancelable) {
        e.preventDefault();
      }
      this.isSwiping = true;

      const progress = Math.min(Math.abs(xDiff) / this.config.threshold, 1);
      const direction = xDiff > 0 ? 'right' : 'left';
      
      if (this.callbacks.onMove) {
        this.callbacks.onMove(progress, direction);
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.touchStartX || !this.touchStartY) return;

    const touch = e.changedTouches[0];
    this.touchEndX = touch.pageX;
    this.touchEndY = touch.pageY;

    this.handleSwipe();
    this.reset();
  }

  private handleTouchCancel(): void {
    if (this.callbacks.onEnd) {
      this.callbacks.onEnd();
    }
    this.reset();
  }

  private handleSwipe(): void {
    const xDiff = this.touchEndX - this.touchStartX;
    const yDiff = this.touchEndY - this.touchStartY;
    const elapsedTime = Date.now() - this.touchStartTime;

    if (elapsedTime > this.config.allowedTime) {
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
      return;
    }

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (Math.abs(xDiff) > this.config.threshold && Math.abs(yDiff) < this.config.restraint) {
        if (xDiff > 0 && this.callbacks.onSwipeRight) {
          this.callbacks.onSwipeRight();
        } else if (xDiff < 0 && this.callbacks.onSwipeLeft) {
          this.callbacks.onSwipeLeft();
        }
      } else {
        if (this.callbacks.onEnd) {
          this.callbacks.onEnd();
        }
      }
    } else {
      if (Math.abs(yDiff) > this.config.threshold && Math.abs(xDiff) < this.config.restraint) {
        if (yDiff > 0 && this.callbacks.onSwipeDown) {
          this.callbacks.onSwipeDown();
        } else if (yDiff < 0 && this.callbacks.onSwipeUp) {
          this.callbacks.onSwipeUp();
        }
      } else {
        if (this.callbacks.onEnd) {
          this.callbacks.onEnd();
        }
      }
    }
  }

  private reset(): void {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.isSwiping = false;
  }

  get isCurrentlySwiping(): boolean {
    return this.isSwiping;
  }
} 