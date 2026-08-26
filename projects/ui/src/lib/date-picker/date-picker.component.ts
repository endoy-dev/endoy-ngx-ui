import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCalendar, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

const DROPDOWN_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface DayCell {
  day: number;
  date: Date;
}

@Component({
  selector: 'eui-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, LucideCalendar, LucideChevronLeft, LucideChevronRight],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true,
    },
  ],
  host: { class: 'block' },
  template: `
    <button #trigger
            type="button"
            cdkOverlayOrigin
            #origin="cdkOverlayOrigin"
            class="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-0 dark:bg-surface-900 text-left text-surface-900 dark:text-surface-0 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="isDisabled()"
            [attr.aria-expanded]="open()"
            (click)="toggle()"
            (blur)="onTouched()">
      <span class="truncate {{ value() ? '' : 'text-surface-400 dark:text-surface-500' }}">
        {{ value() ? displayValue() : 'dd/mm/yyyy' }}
      </span>
      <svg lucideCalendar [size]="16" class="shrink-0 text-surface-400"></svg>
    </button>

    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="origin"
                 [cdkConnectedOverlayOpen]="open()"
                 [cdkConnectedOverlayPositions]="positions"
                 (overlayOutsideClick)="close()"
                 (overlayKeydown)="onOverlayKeydown($event)"
                 (detach)="close()">
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-xl p-3 w-72"
           [style]="panelStyle() ?? null">
        <div class="flex items-center justify-between mb-2">
          <button type="button"
                  class="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  aria-label="Previous month" (click)="prevMonth()">
            <svg lucideChevronLeft [size]="16"></svg>
          </button>
          <span class="text-sm font-semibold text-surface-900 dark:text-surface-0">{{ monthLabel() }}</span>
          <button type="button"
                  class="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                  aria-label="Next month" (click)="nextMonth()">
            <svg lucideChevronRight [size]="16"></svg>
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-1">
          @for (wd of weekdays; track wd) {
            <div class="text-center text-xs font-medium text-surface-400 py-1">{{ wd }}</div>
          }
        </div>

        <div class="grid grid-cols-7 gap-1">
          @for (cell of days(); track $index) {
            @if (cell) {
              <button type="button"
                      class="h-8 w-8 flex items-center justify-center rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 {{ cellClasses(cell) }}"
                      (click)="selectDate(cell.date)">
                {{ cell.day }}
              </button>
            } @else {
              <div class="h-8 w-8"></div>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class DatePicker implements ControlValueAccessor {
  public readonly dateFormat = input<string>('dd/mm/yy');
  public readonly panelStyle = input<Record<string, string>>();

  protected readonly positions = DROPDOWN_POSITIONS;
  protected readonly weekdays = WEEKDAYS;
  protected readonly open = signal(false);

  protected readonly value = signal<Date | null>(null);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.cvaDisabled());

  private readonly viewYear = signal(new Date().getFullYear());
  private readonly viewMonth = signal(new Date().getMonth());

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');

  private onChange: (value: Date | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly displayValue = computed(() => {
    const date = this.value();
    return date ? this.formatDate(date, this.dateFormat()) : '';
  });

  protected readonly monthLabel = computed(() => `${MONTH_NAMES[this.viewMonth()]} ${this.viewYear()}`);

  protected readonly days = computed<(DayCell | null)[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDay = new Date(year, month, 1);
    const lead = (firstDay.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();

    const cells: (DayCell | null)[] = [];
    for (let i = 0; i < lead; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= total; day++) {
      cells.push({ day, date: new Date(year, month, day) });
    }
    return cells;
  });

  protected cellClasses(cell: DayCell): string {
    if (this.isSameDay(cell.date, this.value())) {
      return 'bg-gradient-to-br from-primary-600 to-accent-600 text-white font-semibold';
    }
    if (this.isSameDay(cell.date, new Date())) {
      return 'text-surface-900 dark:text-surface-0 ring-1 ring-inset ring-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800';
    }
    return 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800';
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.syncView();
      this.open.set(true);
    }
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
      this.onTouched();
    }
  }

  protected prevMonth(): void {
    const month = this.viewMonth();
    if (month === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth.set(month - 1);
    }
  }

  protected nextMonth(): void {
    const month = this.viewMonth();
    if (month === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth.set(month + 1);
    }
  }

  protected selectDate(date: Date): void {
    this.value.set(date);
    this.onChange(date);
    this.close();
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  private syncView(): void {
    const date = this.value() ?? new Date();
    this.viewYear.set(date.getFullYear());
    this.viewMonth.set(date.getMonth());
  }

  private isSameDay(a: Date, b: Date | null): boolean {
    return (
      b != null &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  private formatDate(date: Date, format: string): string {
    return format
      .replace(/dd/g, this.pad(date.getDate()))
      .replace(/mm/g, this.pad(date.getMonth() + 1))
      .replace(/yy/g, `${date.getFullYear()}`)
      .replace(/y/g, `${date.getFullYear()}`.slice(-2));
  }

  private parseDate(text: string, format: string): Date | null {
    const order: ('d' | 'm' | 'y')[] = [];
    let pattern = '';
    let i = 0;
    while (i < format.length) {
      if (format.startsWith('dd', i)) {
        order.push('d');
        pattern += '(\\d{1,2})';
        i += 2;
      } else if (format.startsWith('mm', i)) {
        order.push('m');
        pattern += '(\\d{1,2})';
        i += 2;
      } else if (format.startsWith('yy', i)) {
        order.push('y');
        pattern += '(\\d{4})';
        i += 2;
      } else if (format.startsWith('y', i)) {
        order.push('y');
        pattern += '(\\d{2})';
        i += 1;
      } else {
        pattern += format[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        i += 1;
      }
    }

    const match = new RegExp(`^${pattern}$`).exec(text.trim());
    if (!match) {
      return null;
    }

    let day = 1;
    let month = 0;
    let year = new Date().getFullYear();
    order.forEach((token, idx) => {
      const num = parseInt(match[idx + 1], 10);
      if (token === 'd') {
        day = num;
      } else if (token === 'm') {
        month = num - 1;
      } else {
        year = num < 100 ? 2000 + num : num;
      }
    });

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  public writeValue(value: Date | string | null): void {
    if (value == null || value === '') {
      this.value.set(null);
    } else if (value instanceof Date) {
      this.value.set(isNaN(value.getTime()) ? null : value);
    } else {
      const parsed = this.parseDate(value, this.dateFormat());
      this.value.set(parsed ?? (isNaN(new Date(value).getTime()) ? null : new Date(value)));
    }
    this.syncView();
  }

  public registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
