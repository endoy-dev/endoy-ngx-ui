import { Injectable, signal } from '@angular/core';

export type ConfirmSeverity = 'danger' | 'warn' | 'primary';

export interface ConfirmOptions {
  message: string;
  severity?: ConfirmSeverity;
  acceptLabel?: string;
  rejectLabel?: string;
  accept: () => void;
  reject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _request = signal<ConfirmOptions | null>(null);
  readonly activeRequest = this._request.asReadonly();

  public confirm(options: ConfirmOptions): void {
    this._request.set(options);
  }

  public accept(): void {
    const request = this._request();
    this._request.set(null);
    request?.accept();
  }

  public reject(): void {
    const request = this._request();
    this._request.set(null);
    request?.reject?.();
  }
}
