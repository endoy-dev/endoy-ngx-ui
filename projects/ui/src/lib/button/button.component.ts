import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';
import { Ripple } from '../ripple/ripple.directive';

type Severity = 'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'help';

const BASE =
  'relative inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none ' +
  'transition-all duration-150 focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const FILL: Record<Severity, string> = {
  primary: 'bg-gradient-to-br from-primary-600 to-accent-600 text-white hover:brightness-110 shadow-sm shadow-primary-600/20',
  help: 'bg-gradient-to-br from-accent-600 to-magenta-600 text-white hover:brightness-110 shadow-sm shadow-accent-600/20',
  secondary: 'bg-surface-500 dark:bg-surface-600 text-white hover:bg-surface-600 dark:hover:bg-surface-500',
  success: 'bg-success-600 text-white hover:bg-success-700',
  warn: 'bg-warn-600 text-white hover:bg-warn-700',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
};

const OUTLINED: Record<Severity, string> = {
  primary: 'bg-transparent border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40',
  help: 'bg-transparent border-2 border-accent-600 text-accent-600 dark:border-accent-400 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/40',
  secondary: 'bg-transparent border-2 border-surface-400 text-surface-600 dark:border-surface-500 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
  success: 'bg-transparent border-2 border-success-600 text-success-600 hover:bg-success-50 dark:hover:bg-success-700/20',
  warn: 'bg-transparent border-2 border-warn-600 text-warn-600 hover:bg-warn-50 dark:hover:bg-warn-700/20',
  danger: 'bg-transparent border-2 border-danger-600 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-700/20',
};

const SIZE: Record<'sm' | 'md', string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-5 py-3 rounded-xl',
};

@Component({
  selector: 'button[euiButton], a[euiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  hostDirectives: [Ripple],
  host: {
    '[class]': 'hostClasses()',
    '[attr.aria-busy]': 'loading()',
    '[class.pointer-events-none]': 'loading()',
    '[class.cursor-wait]': 'loading()',
  },
  template: `
    @if (loading()) {
      <span class="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"></span>
    } @else if (icon() && iconPos() === 'left') {
      <svg [lucideIcon]="icon()!" [size]="iconSize()"></svg>
    }

    @if (label()) {
      <span>{{ label() }}</span>
    }

    <ng-content/>

    @if (!loading() && icon() && iconPos() === 'right') {
      <svg [lucideIcon]="icon()!" [size]="iconSize()"></svg>
    }
  `,
})
export class Button {
  public readonly icon = input<LucideIconInput>();
  public readonly iconPos = input<'left' | 'right'>('left');
  public readonly label = input<string>();
  public readonly severity = input<Severity>('primary');
  public readonly rounded = input(false);
  public readonly outlined = input(false);
  public readonly loading = input(false);
  public readonly size = input<'sm' | 'md'>('md');

  protected readonly iconSize = computed(() => (this.size() === 'sm' ? 14 : 16));

  protected readonly hostClasses = computed(() => {
    const sev = this.severity();
    const variant = this.outlined() ? OUTLINED[sev] : FILL[sev];
    const shape = this.rounded() ? 'rounded-full p-0' : SIZE[this.size()];
    return `${BASE} ${variant} ${shape}`;
  });
}
