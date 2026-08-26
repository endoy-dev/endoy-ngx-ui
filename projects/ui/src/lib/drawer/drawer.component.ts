import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { lockBodyScroll, unlockBodyScroll } from '../util/body-scroll-lock';

export type DrawerPosition = 'left' | 'right';

@Component({
  selector: 'eui-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[1000]" (keydown.escape)="onEscape($event)">
        <div class="eui-drawer-backdrop absolute inset-0 bg-surface-900/35 dark:bg-surface-950/60 backdrop-blur-sm"
             [attr.aria-hidden]="true"
             (click)="close()"></div>

        <aside class="eui-drawer-panel absolute inset-y-0 flex h-full w-80 max-w-[90vw] flex-col
                 border-surface-200 bg-surface-0 shadow-2xl
                 text-surface-800 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-100"
               [class.left-0]="position() === 'left'"
               [class.right-0]="position() === 'right'"
               [class.border-r]="position() === 'left'"
               [class.border-l]="position() === 'right'"
               [class.eui-drawer-left]="position() === 'left'"
               [class.eui-drawer-right]="position() === 'right'"
               role="dialog"
               aria-modal="true"
               cdkTrapFocus
               [cdkTrapFocusAutoCapture]="true">
          <ng-content/>
        </aside>
      </div>
    }
  `,
  styles: [
    `
      .eui-drawer-panel {
        animation: none;
      }
      .eui-drawer-left {
        animation: eui-drawer-in-left 250ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .eui-drawer-right {
        animation: eui-drawer-in-right 250ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .eui-drawer-backdrop {
        animation: eui-drawer-fade-in 200ms ease;
      }
      @keyframes eui-drawer-in-left {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes eui-drawer-in-right {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes eui-drawer-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .eui-drawer-left,
        .eui-drawer-right,
        .eui-drawer-backdrop {
          animation: none;
        }
      }
    `,
  ],
})
export class Drawer {
  public readonly open = model<boolean>(false);
  public readonly position = input<DrawerPosition>('left');

  public readonly onHide = output<void>();

  private wasOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen && !this.wasOpen) {
          lockBodyScroll();
        } else if (!isOpen && this.wasOpen) {
          unlockBodyScroll();
          this.onHide.emit();
        }
        this.wasOpen = isOpen;
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.wasOpen) {
        unlockBodyScroll();
      }
    });
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onEscape(event: Event): void {
    event.stopPropagation();
    this.close();
  }
}
