import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastMessage {
  severity: ToastSeverity;
  summary?: string;
  detail?: string;
  life?: number;
}

export interface ToastItem extends ToastMessage {
  id: string;
  removing: boolean;
}

const DEFAULT_LIFE = 3000;
const EXIT_ANIMATION_MS = 220;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastItem[]>([]);
  readonly toasts = this._toasts.asReadonly();

  public add(message: ToastMessage): void {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const life = message.life ?? DEFAULT_LIFE;
    this._toasts.update((toasts) => [...toasts, { ...message, id, removing: false }]);

    if (life > 0) {
      setTimeout(() => this.remove(id), life);
    }
  }

  public remove(id: string): void {
    const toast = this._toasts().find((t) => t.id === id);
    if (!toast || toast.removing) {
      return;
    }
    this._toasts.update((toasts) => toasts.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => {
      this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }

  public clear(): void {
    this._toasts.set([]);
  }
}
