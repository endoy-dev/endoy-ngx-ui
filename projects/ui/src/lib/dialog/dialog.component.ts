import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  TemplateRef,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { LucideX } from '@lucide/angular';
import { lockBodyScroll, unlockBodyScroll } from '../util/body-scroll-lock';

export type DialogSize = 'sm' | 'md' | 'lg';

let dialogSeq = 0;

@Component({
  selector: 'eui-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CdkTrapFocus, LucideX],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
           (keydown.escape)="onEscape($event)">
        <div class="eui-dialog-backdrop absolute inset-0 bg-surface-900/35 dark:bg-surface-950/60 backdrop-blur-sm"
             [attr.aria-hidden]="true"
             (click)="onBackdropClick()">
        </div>

        <div
          class="eui-dialog-panel relative flex max-h-[90vh] w-[90vw] flex-col rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-2xl text-surface-800 dark:text-surface-100"
          [class.max-w-md]="size() === 'sm'"
          [class.max-w-2xl]="size() === 'md'"
          [class.max-w-5xl]="size() === 'lg'"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          cdkTrapFocus
          [cdkTrapFocusAutoCapture]="true">
          <div class="flex items-center justify-between gap-4 border-b border-surface-200 dark:border-surface-800 px-6 py-4">
            <h2 [id]="titleId" class="text-lg font-semibold text-surface-900 dark:text-surface-0">
              {{ header() }}
            </h2>
            <button
              type="button"
              class="-mr-2 shrink-0 rounded-lg p-1.5 text-surface-500 transition-colors duration-150
                     hover:bg-surface-200/60 hover:text-surface-800
                     dark:text-surface-400 dark:hover:bg-surface-700/60 dark:hover:text-surface-100
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
              aria-label="Close dialog"
              (click)="close()"
            >
              <svg lucideX [size]="20"></svg>
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <ng-content/>
          </div>

          @if (footerTemplate()) {
            <div class="flex flex-wrap items-center justify-end gap-2 border-t border-surface-200 dark:border-surface-800 px-6 py-4">
              <ng-container [ngTemplateOutlet]="footerTemplate()!"/>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class Dialog {
  public readonly visible = model<boolean>(false);

  public readonly header = input<string>('');
  public readonly modal = input(true);
  public readonly dismissableMask = input(true);
  public readonly size = input<DialogSize>('md');

  public readonly onHide = output<void>();

  protected readonly footerTemplate = contentChild<TemplateRef<unknown>>('footer');

  protected readonly titleId = `eui-dialog-title-${dialogSeq++}`;

  private wasVisible = false;

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      untracked(() => {
        if (isVisible && !this.wasVisible) {
          lockBodyScroll();
        } else if (!isVisible && this.wasVisible) {
          unlockBodyScroll();
          this.onHide.emit();
        }
        this.wasVisible = isVisible;
      });
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.wasVisible) {
        unlockBodyScroll();
      }
    });
  }

  protected close(): void {
    this.visible.set(false);
  }

  protected onBackdropClick(): void {
    if (this.dismissableMask()) {
      this.close();
    }
  }

  protected onEscape(event: Event): void {
    event.stopPropagation();
    this.close();
  }
}
