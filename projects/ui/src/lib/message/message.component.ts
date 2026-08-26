import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideDynamicIcon,
  LucideIconInput,
  LucideInfo,
  LucideTriangleAlert,
} from '@lucide/angular';

type MessageSeverity = 'success' | 'info' | 'warn' | 'error';

const STYLES: Record<MessageSeverity, string> = {
  success: 'bg-success-50 dark:bg-success-700/15 text-success-700 dark:text-success-400 border-success-200 dark:border-success-700/40',
  info: 'bg-info-50 dark:bg-info-700/15 text-info-700 dark:text-info-400 border-info-200 dark:border-info-700/40',
  warn: 'bg-warn-50 dark:bg-warn-700/15 text-warn-700 dark:text-warn-400 border-warn-200 dark:border-warn-700/40',
  error: 'bg-danger-50 dark:bg-danger-700/15 text-danger-700 dark:text-danger-400 border-danger-200 dark:border-danger-700/40',
};

const ICONS: Record<MessageSeverity, LucideIconInput> = {
  success: LucideCircleCheck,
  info: LucideInfo,
  warn: LucideTriangleAlert,
  error: LucideCircleX,
};

@Component({
  selector: 'eui-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <svg [lucideIcon]="iconName()" [size]="15" class="mt-0.5 shrink-0"></svg>
    <div class="min-w-0"><ng-content /></div>
  `,
})
export class Message {
  public readonly severity = input<MessageSeverity>('info');

  protected readonly iconName = computed(() => ICONS[this.severity()]);

  protected readonly hostClasses = computed(
    () => `flex items-start gap-2 rounded-lg border px-4 py-3 mb-3 text-sm leading-snug ${STYLES[this.severity()]}`,
  );
}
