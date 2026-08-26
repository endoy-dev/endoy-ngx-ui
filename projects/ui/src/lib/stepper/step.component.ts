import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {LucideCircleCheck} from '@lucide/angular';
import {Stepper} from './stepper.component';
import {StepList} from './step-list.component';

type StepState = 'completed' | 'active' | 'upcoming';

@Component({
  selector: 'eui-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCircleCheck],
  host: {
    class: 'flex items-center',
    '[class.flex-1]': '!isLast()',
  },
  template: `
    <button type="button"
            class="flex items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            [class.cursor-default]="!clickable()"
            [class.cursor-pointer]="clickable()"
            [attr.aria-current]="state() === 'active' ? 'step' : null"
            [disabled]="!clickable()"
            (click)="onClick()">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            [class.bg-gradient-to-br]="state() === 'active'"
            [class.from-primary-600]="state() === 'active'"
            [class.via-accent-600]="state() === 'active'"
            [class.to-magenta-500]="state() === 'active'"
            [class.text-white]="state() !== 'upcoming'"
            [class.shadow-md]="state() === 'active'"
            [class.bg-primary-600]="state() === 'completed'"
            [class.bg-surface-200]="state() === 'upcoming'"
            [class.text-surface-500]="state() === 'upcoming'"
            [class.dark:bg-surface-700]="state() === 'upcoming'"
            [class.dark:text-surface-400]="state() === 'upcoming'">
        @if (state() === 'completed') {
          <svg lucideCircleCheck [size]="20"></svg>
        } @else {
          {{ value() }}
        }
      </span>

      <span class="hidden text-sm font-medium md:inline"
            [class.text-surface-900]="state() !== 'upcoming'"
            [class.dark:text-surface-0]="state() !== 'upcoming'"
            [class.text-surface-400]="state() === 'upcoming'"
            [class.dark:text-surface-500]="state() === 'upcoming'">
        <ng-content/>
      </span>
    </button>

    @if (!isLast()) {
      <div class="mx-3 h-0.5 flex-1 rounded-full"
           [class.bg-primary-600]="state() === 'completed'"
           [class.bg-surface-200]="state() !== 'completed'"
           [class.dark:bg-surface-700]="state() !== 'completed'">
      </div>
    }
  `,
})
export class Step {
  readonly stepper = inject(Stepper);
  readonly stepList = inject(StepList);

  public readonly value = input.required<number>();

  protected readonly isLast = computed(() => {
    const steps = this.stepList.steps();
    return steps.length > 0 && steps[steps.length - 1] === this;
  });

  protected readonly state = computed<StepState>(() => {
    const current = this.stepper.value();
    if (this.value() < current) {
      return 'completed';
    }
    return this.value() === current ? 'active' : 'upcoming';
  });

  protected readonly clickable = computed(() => !this.stepper.linear());

  protected onClick(): void {
    if (this.clickable()) {
      this.stepper.goTo(this.value());
    }
  }
}
