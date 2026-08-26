import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

export interface PageChangeEvent {
  first: number;
  rows: number;
}

@Component({
  selector: 'eui-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronLeft, LucideChevronRight],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 pt-1
             text-sm text-surface-600 dark:text-surface-300">
      <div class="flex items-center gap-2">
        <label class="text-surface-500 dark:text-surface-400" [attr.for]="selectId">Rows per page</label>
        <select #sel
                [id]="selectId"
                class="rounded-lg border border-surface-300 bg-surface-0 px-2 py-1 text-surface-800
                 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-100
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
                [value]="rows()"
                (change)="onRowsChange(sel.value)">
          @for (option of rowsPerPageOptions(); track option) {
            <option [value]="option">{{ option }}</option>
          }
        </select>
      </div>

      @if (showCurrentPageReport() && currentPageReportTemplate()) {
        <span class="order-last w-full text-center sm:order-none sm:w-auto">{{ report() }}</span>
      }

      <div class="flex items-center gap-1">
        <button type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-300 text-surface-600
                 transition-colors duration-150 enabled:hover:bg-surface-100 disabled:opacity-40
                 dark:border-surface-700 dark:text-surface-300 dark:enabled:hover:bg-surface-800
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
                aria-label="Previous page"
                [disabled]="!canPrev()"
                (click)="prev()">
          <svg lucideChevronLeft [size]="16"></svg>
        </button>
        <span class="px-2 tabular-nums">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
        <button type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-300 text-surface-600
                 transition-colors duration-150 enabled:hover:bg-surface-100 disabled:opacity-40
                 dark:border-surface-700 dark:text-surface-300 dark:enabled:hover:bg-surface-800
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50"
                aria-label="Next page"
                [disabled]="!canNext()"
                (click)="next()">
          <svg lucideChevronRight [size]="16"></svg>
        </button>
      </div>
    </div>
  `,
})
export class Paginator {
  public readonly first = input(0);
  public readonly rows = input(10);
  public readonly totalRecords = input(0);
  public readonly rowsPerPageOptions = input<number[]>([10, 25, 50]);
  public readonly currentPageReportTemplate = input<string>('');
  public readonly showCurrentPageReport = input(true);

  public readonly pageChange = output<PageChangeEvent>();

  protected readonly selectId = `eui-paginator-rows-${Math.random().toString(36).slice(2, 8)}`;

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRecords() / this.rows())));
  protected readonly currentPage = computed(() => Math.floor(this.first() / Math.max(1, this.rows())));
  protected readonly canPrev = computed(() => this.currentPage() > 0);
  protected readonly canNext = computed(() => this.currentPage() < this.totalPages() - 1);

  protected readonly report = computed(() => {
    const total = this.totalRecords();
    const first = total === 0 ? 0 : this.first() + 1;
    const last = Math.min(this.first() + this.rows(), total);
    return this.currentPageReportTemplate()
      .replace('{first}', String(first))
      .replace('{last}', String(last))
      .replace('{totalRecords}', String(total));
  });

  protected prev(): void {
    if (this.canPrev()) {
      this.pageChange.emit({ first: this.first() - this.rows(), rows: this.rows() });
    }
  }

  protected next(): void {
    if (this.canNext()) {
      this.pageChange.emit({ first: this.first() + this.rows(), rows: this.rows() });
    }
  }

  protected onRowsChange(value: string): void {
    const rows = Number(value) || this.rows();
    this.pageChange.emit({ first: 0, rows });
  }
}
