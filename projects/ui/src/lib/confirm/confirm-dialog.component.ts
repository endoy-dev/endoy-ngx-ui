import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput, LucideInfo, LucideTrash2 } from '@lucide/angular';
import { Dialog } from '../dialog/dialog.component';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'eui-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, LucideDynamicIcon],
  template: `
    <eui-dialog size="sm"
                [header]="headerText()"
                [visible]="!!confirmService.activeRequest()"
                [modal]="true"
                [dismissableMask]="true"
                (onHide)="onHide()">
      @if (confirmService.activeRequest(); as request) {
        <div class="flex items-start gap-4">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                [class.bg-danger-50]="severity() === 'danger'"
                [class.text-danger-600]="severity() === 'danger'"
                [class.bg-warn-50]="severity() === 'warn'"
                [class.text-warn-600]="severity() === 'warn'"
                [class.bg-primary-50]="severity() === 'primary'"
                [class.text-primary-600]="severity() === 'primary'">
            <svg [lucideIcon]="iconName()" [size]="22"></svg>
          </span>
          <p class="pt-1.5 text-surface-700 dark:text-surface-200">{{ request.message }}</p>
        </div>
      }

      <ng-template #footer>
        @if (confirmService.activeRequest(); as request) {
          <button type="button"
                  class="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 transition-colors duration-150
                   hover:bg-surface-200/60 dark:text-surface-200 dark:hover:bg-surface-700/60
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
                  (click)="confirmService.reject()">
            {{ request.rejectLabel ?? 'Cancel' }}
          </button>
          <button type="button"
                  class="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  [class.bg-danger-600]="severity() === 'danger'"
                  [class.hover:bg-danger-700]="severity() === 'danger'"
                  [class.focus-visible:ring-danger-500]="severity() === 'danger'"
                  [class.bg-warn-600]="severity() === 'warn'"
                  [class.hover:bg-warn-700]="severity() === 'warn'"
                  [class.focus-visible:ring-warn-500]="severity() === 'warn'"
                  [class.bg-gradient-to-br]="severity() === 'primary'"
                  [class.from-primary-600]="severity() === 'primary'"
                  [class.via-accent-600]="severity() === 'primary'"
                  [class.to-magenta-500]="severity() === 'primary'"
                  [class.focus-visible:ring-primary-500]="severity() === 'primary'"
                  (click)="confirmService.accept()">
            {{ request.acceptLabel ?? 'Confirm' }}
          </button>
        }
      </ng-template>
    </eui-dialog>
  `,
})
export class ConfirmDialog {
  readonly confirmService = inject(ConfirmService);

  protected readonly severity = computed(() => this.confirmService.activeRequest()?.severity ?? 'primary');
  protected readonly headerText = computed(() => (this.severity() === 'danger' ? 'Confirm deletion' : 'Please confirm'));
  protected readonly iconName = computed<LucideIconInput>(() => (this.severity() === 'danger' ? LucideTrash2 : LucideInfo));

  protected onHide(): void {
    if (this.confirmService.activeRequest()) {
      this.confirmService.reject();
    }
  }
}
