import { OverlayModule } from '@angular/cdk/overlay';
import { ConnectedPosition } from '@angular/cdk/overlay';
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
import { LucideChevronDown, LucideCircleCheck } from '@lucide/angular';
import { Input } from '../input/input.directive';

const DROPDOWN_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

@Component({
  selector: 'eui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, LucideChevronDown, LucideCircleCheck, Input],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
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
      <span class="truncate {{ hasValue() ? '' : 'text-surface-400 dark:text-surface-500' }}">
        {{ displayLabel() }}
      </span>
      <span class="flex items-center gap-1 shrink-0">
        @if (showClear() && hasValue() && !loading()) {
          <span role="button"
                aria-label="Clear"
                class="flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors text-lg leading-none"
                (click)="clear($event)">&times;</span>
        }
        @if (loading()) {
          <span class="inline-block w-4 h-4 rounded-full border-2 border-surface-300 border-t-primary-500 animate-spin"></span>
        }
        <svg lucideChevronDown [size]="16" class="text-surface-400 transition-transform duration-150" [class.rotate-180]="open()"></svg>
      </span>
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayWidth]="panelWidth()"
      (overlayOutsideClick)="close()"
      (overlayKeydown)="onOverlayKeydown($event)"
      (detach)="close()"
    >
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-xl overflow-hidden">
        @if (filter()) {
          <div class="p-2 border-b border-surface-200 dark:border-surface-700">
            <input euiInput
                   type="text"
                   class="w-full"
                   placeholder="Search"
                   [value]="filterText()"
                   (input)="onFilterInput($event)"
                   (click)="$event.stopPropagation()"/>
          </div>
        }
        <div class="max-h-60 overflow-auto py-1">
          @if (loading()) {
            <div class="px-3 py-4 flex items-center justify-center gap-2 text-sm text-surface-400">
              <span class="inline-block w-4 h-4 rounded-full border-2 border-surface-300 border-t-primary-500 animate-spin"></span>
              Loading...
            </div>
          } @else if (filteredOptions().length === 0) {
            <div class="px-3 py-4 text-center text-sm text-surface-400">No results found</div>
          } @else {
            @for (opt of filteredOptions(); track $index) {
              <button type="button"
                      class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 text-surface-900 dark:text-surface-0 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors {{ isSelected(opt) ? 'bg-primary-50 dark:bg-primary-950/40' : '' }}"
                      (click)="selectOption(opt)">
                <span class="truncate">{{ getLabel(opt) }}</span>
                @if (isSelected(opt)) {
                  <svg lucideCircleCheck [size]="16" class="text-primary-600 dark:text-primary-400 shrink-0"></svg>
                }
              </button>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class Select implements ControlValueAccessor {
  public readonly options = input<any[]>([]);
  public readonly optionLabel = input<string>();
  public readonly optionValue = input<string>();
  public readonly filter = input(false);
  public readonly filterBy = input<string>();
  public readonly showClear = input(false);
  public readonly loading = input(false);
  public readonly placeholder = input<string>('');

  protected readonly positions = DROPDOWN_POSITIONS;
  protected readonly open = signal(false);
  protected readonly filterText = signal('');
  protected readonly panelWidth = signal<number>(0);

  private readonly value = signal<any>(null);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.cvaDisabled());

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');

  private onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hasValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined && v !== '';
  });

  protected readonly displayLabel = computed(() => {
    if (!this.hasValue()) {
      return this.placeholder();
    }
    const match = this.options().find((opt) => this.getValue(opt) === this.value());
    return match !== undefined ? this.getLabel(match) : String(this.value());
  });

  protected readonly filteredOptions = computed(() => {
    const term = this.filterText().trim().toLowerCase();
    if (!this.filter() || !term) {
      return this.options();
    }
    const key = this.filterBy() ?? this.optionLabel();
    return this.options().filter((opt) => {
      const field = key ? opt?.[key] : opt;
      return String(field ?? '').toLowerCase().includes(term);
    });
  });

  protected getLabel(opt: any): string {
    const key = this.optionLabel();
    return String((key ? opt?.[key] : opt) ?? '');
  }

  protected getValue(opt: any): any {
    const key = this.optionValue();
    return key ? opt?.[key] : opt;
  }

  protected isSelected(opt: any): boolean {
    return this.getValue(opt) === this.value();
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.panelWidth.set(this.trigger().nativeElement.offsetWidth);
      this.open.set(true);
    }
  }

  protected close(): void {
    if (this.open()) {
      this.open.set(false);
      this.filterText.set('');
      this.onTouched();
    }
  }

  protected selectOption(opt: any): void {
    const value = this.getValue(opt);
    this.value.set(value);
    this.onChange(value);
    this.close();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
  }

  protected onFilterInput(event: Event): void {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  public writeValue(value: any): void {
    this.value.set(value ?? null);
  }

  public registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
