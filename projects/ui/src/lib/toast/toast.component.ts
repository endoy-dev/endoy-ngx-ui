import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideDynamicIcon,
  LucideIconInput,
  LucideInfo,
  LucideTriangleAlert,
  LucideX,
} from '@lucide/angular';
import { ToastItem, ToastSeverity, ToastService } from './toast.service';
import { EUI_LABELS } from '../i18n/ui-labels';

const ICONS: Record<ToastSeverity, LucideIconInput> = {
  success: LucideCircleCheck,
  info: LucideInfo,
  warn: LucideTriangleAlert,
  error: LucideCircleX,
};

@Component({
  selector: 'eui-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon, LucideX],
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-[2000] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
         aria-live="polite"
         aria-atomic="false">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="eui-toast-item pointer-events-auto glass flex items-start gap-3 overflow-hidden rounded-lg
                 p-3 pl-4 shadow-lg text-surface-800 dark:text-surface-100"
             [class.eui-toast-leaving]="toast.removing"
             role="alert">
          <span class="absolute inset-y-0 left-0 w-1"
                [class.bg-success-600]="toast.severity === 'success'"
                [class.bg-info-600]="toast.severity === 'info'"
                [class.bg-warn-600]="toast.severity === 'warn'"
                [class.bg-danger-600]="toast.severity === 'error'"></span>

          <span class="mt-0.5 shrink-0"
                [class.text-success-600]="toast.severity === 'success'"
                [class.text-info-600]="toast.severity === 'info'"
                [class.text-warn-600]="toast.severity === 'warn'"
                [class.text-danger-600]="toast.severity === 'error'">
            <svg [lucideIcon]="iconFor(toast)" [size]="20"></svg>
          </span>

          <div class="min-w-0 flex-1">
            @if (toast.summary) {
              <div class="font-semibold leading-snug break-words">{{ toast.summary }}</div>
            }
            @if (toast.detail) {
              <div class="text-sm leading-snug break-words text-surface-600 dark:text-surface-300">
                {{ toast.detail }}
              </div>
            }
          </div>

          <button type="button"
                  class="shrink-0 rounded-md p-1 text-surface-400 transition-colors duration-150
                   hover:bg-surface-200/60 hover:text-surface-700
                   dark:hover:bg-surface-700/60 dark:hover:text-surface-100
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
                  [attr.aria-label]="labels().dismissNotification"
                  (click)="toastService.remove(toast.id)">
            <svg lucideX [size]="14" [strokeWidth]="2.2"></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .eui-toast-item {
        animation: eui-toast-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
        transition:
          transform 200ms ease,
          opacity 200ms ease;
      }
      .eui-toast-leaving {
        transform: translateX(120%);
        opacity: 0;
      }
      @keyframes eui-toast-in {
        from {
          transform: translateX(120%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .eui-toast-item {
          animation: none;
          transition: opacity 150ms ease;
        }
        .eui-toast-leaving {
          transform: none;
        }
      }
    `,
  ],
})
export class Toast {
  protected readonly labels = inject(EUI_LABELS);
  readonly toastService = inject(ToastService);

  protected iconFor(toast: ToastItem): LucideIconInput {
    return ICONS[toast.severity];
  }
}
