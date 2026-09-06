import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EUI_LABELS } from '../i18n/ui-labels';

@Component({
  selector: 'eui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-block animate-spin rounded-full border-4 border-solid
             border-surface-200 border-t-primary-600 border-r-accent-600
             dark:border-surface-700 dark:border-t-primary-400 dark:border-r-accent-400"
          role="progressbar"
          [attr.aria-label]="labels().loading"
          [style.width]="size()"
          [style.height]="size()"
          [style.border-width]="borderWidth()"
    ></span>
  `,
})
export class Spinner {
  protected readonly labels = inject(EUI_LABELS);
  public readonly size = input<string>('50px');

  protected readonly borderWidth = computed(() => {
    const px = parseFloat(this.size());
    if (Number.isNaN(px)) {
      return '4px';
    }
    return `${Math.min(6, Math.max(3, Math.round(px / 12)))}px`;
  });
}
