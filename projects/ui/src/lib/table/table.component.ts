import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Spinner } from '../spinner/spinner.component';
import { Paginator, PageChangeEvent } from './paginator.component';

export interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
}

@Component({
  selector: 'eui-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, Spinner, Paginator],
  template: `
    <div class="card flex flex-col gap-5">
      @if (captionTemplate()) {
        <div>
          <ng-container [ngTemplateOutlet]="captionTemplate()!"/>
        </div>
      }

      <div class="relative overflow-x-auto rounded-lg border border-surface-200 dark:border-surface-800">
        <table class="w-full border-collapse text-left text-sm">
          @if (headerTemplate()) {
            <thead class="bg-surface-50 text-sm font-medium text-surface-600
                     dark:bg-surface-800 dark:text-surface-300
                     [&_th]:whitespace-nowrap [&_th]:px-5 [&_th]:py-3.5 [&_th]:font-medium">
            <ng-container [ngTemplateOutlet]="headerTemplate()!"/>
            </thead>
          }

          <tbody class="divide-y divide-surface-200 text-surface-700 dark:divide-surface-800 dark:text-surface-200
                   [&_td]:px-5 [&_td]:py-3.5 [&_td]:align-middle
                   [&_tr]:transition-colors [&_tr]:duration-150
                   [&_tr:hover]:bg-surface-50 dark:[&_tr:hover]:bg-surface-800/50">
            @for (row of value(); track row) {
              <ng-container [ngTemplateOutlet]="bodyTemplate()!" [ngTemplateOutletContext]="{ $implicit: row }"/>
            } @empty {
              @if (!loading()) {
                <tr>
                  <td colspan="100" class="px-4 py-10 text-center text-surface-500 dark:text-surface-400">
                    No records found.
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>

        @if (loading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-surface-0/60 backdrop-blur-[1px]
                   dark:bg-surface-900/60">
            <eui-spinner size="44px"/>
          </div>
        }
      </div>

      @if (paginator()) {
        <eui-paginator
          [first]="first()"
          [rows]="effectiveRows()"
          [totalRecords]="totalRecords()"
          [rowsPerPageOptions]="rowsPerPageOptions()"
          [currentPageReportTemplate]="currentPageReportTemplate()"
          [showCurrentPageReport]="showCurrentPageReport()"
          (pageChange)="onPageChange($event)"
        />
      }
    </div>
  `,
})
export class Table implements OnInit {
  public readonly value = input<unknown[]>([]);
  public readonly totalRecords = input(0);
  public readonly loading = input(false);
  public readonly rows = input(10);
  public readonly rowsPerPageOptions = input<number[]>([10, 25, 50]);
  public readonly lazy = input(true);
  public readonly lazyLoadOnInit = input(true);
  public readonly currentPageReportTemplate = input<string>('');
  public readonly showCurrentPageReport = input(true);
  public readonly paginator = input(true);

  public readonly lazyLoad = output<TableLazyLoadEvent>();

  protected readonly captionTemplate = contentChild<TemplateRef<unknown>>('caption');
  protected readonly headerTemplate = contentChild<TemplateRef<unknown>>('header');
  protected readonly bodyTemplate = contentChild<TemplateRef<unknown>>('body');

  readonly sortField = signal<string | undefined>(undefined);
  readonly sortOrder = signal<1 | -1>(1);

  protected readonly first = signal(0);
  private readonly pageRows = signal<number | null>(null);
  protected readonly effectiveRows = computed(() => this.pageRows() ?? this.rows());

  public ngOnInit(): void {
    if (this.lazy() && this.lazyLoadOnInit()) {
      this.emitLazyLoad();
    }
  }

  public sort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.update((order) => (order === 1 ? -1 : 1));
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
    this.first.set(0);
    this.emitLazyLoad();
  }

  protected onPageChange(event: PageChangeEvent): void {
    this.first.set(event.first);
    this.pageRows.set(event.rows);
    this.emitLazyLoad();
  }

  private emitLazyLoad(): void {
    const field = this.sortField();
    this.lazyLoad.emit({
      first: this.first(),
      rows: this.effectiveRows(),
      sortField: field,
      sortOrder: field ? this.sortOrder() : undefined,
    });
  }
}
