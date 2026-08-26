import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideChevronDown, LucideChevronUp } from '@lucide/angular';
import { Table } from './table.component';

@Component({
  selector: 'eui-sort-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronUp, LucideChevronDown],
  template: `
    <span class="ml-1 inline-flex flex-col -space-y-1.5 align-middle" aria-hidden="true">
      <svg lucideChevronUp
           [size]="10"
           [strokeWidth]="1.75"
           [attr.class]="ascActive() ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'"></svg>
      <svg lucideChevronDown
           [size]="10"
           [strokeWidth]="1.75"
           [attr.class]="descActive() ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'"></svg>
    </span>
  `,
})
export class SortIcon {
  readonly table = inject(Table);

  public readonly field = input.required<string>();

  private readonly active = computed(() => this.table.sortField() === this.field());

  protected readonly ascActive = computed(() => this.active() && this.table.sortOrder() === 1);
  protected readonly descActive = computed(() => this.active() && this.table.sortOrder() === -1);
}
