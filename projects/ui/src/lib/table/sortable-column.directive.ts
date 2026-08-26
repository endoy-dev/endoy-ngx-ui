import { computed, Directive, inject, input } from '@angular/core';
import { Table } from './table.component';

@Directive({
  selector: '[euiSortableColumn]',
  standalone: true,
  host: {
    class: 'cursor-pointer select-none',
    role: 'columnheader',
    '[attr.aria-sort]': 'ariaSort()',
    '(click)': 'onClick()',
    '(keydown.enter)': 'onClick()',
    '(keydown.space)': 'onKeydownSpace($event)',
    tabindex: '0',
  },
})
export class SortableColumn {
  readonly table = inject(Table);

  public readonly euiSortableColumn = input.required<string>();

  protected readonly ariaSort = computed<'ascending' | 'descending' | 'none'>(() => {
    if (this.table.sortField() !== this.euiSortableColumn()) {
      return 'none';
    }
    return this.table.sortOrder() === 1 ? 'ascending' : 'descending';
  });

  protected onClick(): void {
    this.table.sort(this.euiSortableColumn());
  }

  protected onKeydownSpace(event: Event): void {
    event.preventDefault();
    this.onClick();
  }
}
