import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';
import { Input } from '../input/input.directive';
import { EUI_LABELS } from '../i18n/ui-labels';

const DROPDOWN_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

@Component({
  selector: 'eui-multi-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, LucideCheck, LucideChevronDown, Input],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelect),
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
      <span class="flex flex-wrap gap-1 items-center min-h-6">
        @if (!hasValue()) {
          <span class="text-surface-400 dark:text-surface-500">{{ placeholder() }}</span>
        } @else if (isCollapsed()) {
          <span class="inline-flex items-center rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 text-xs px-2 py-0.5">
            {{ selectedValues().length }} selected
          </span>
        } @else {
          @for (opt of selectedOptions(); track $index) {
            <span
              class="inline-flex items-center gap-1 rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-200 text-xs px-2 py-0.5">
              {{ getLabel(opt) }}
              <span
                role="button"
                [attr.aria-label]="labels().remove"
                class="cursor-pointer leading-none hover:text-primary-900 dark:hover:text-primary-50"
                (click)="removeItem(opt, $event)"
              >&times;</span>
            </span>
          }
        }
      </span>
      <span class="flex items-center gap-1 shrink-0">
        @if (showClear() && hasValue() && !loading()) {
          <span
            role="button"
            [attr.aria-label]="labels().clear"
            class="flex items-center text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors text-lg leading-none"
            (click)="clear($event)"
          >&times;</span>
        }
        @if (loading()) {
          <span class="inline-block w-4 h-4 rounded-full border-2 border-surface-300 border-t-primary-500 animate-spin"></span>
        }
        <svg lucideChevronDown [size]="16" class="text-surface-400 transition-transform duration-150" [class.rotate-180]="open()"></svg>
      </span>
    </button>

    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="origin"
                 [cdkConnectedOverlayOpen]="open()"
                 [cdkConnectedOverlayPositions]="positions"
                 [cdkConnectedOverlayWidth]="panelWidth()"
                 (overlayOutsideClick)="close()"
                 (overlayKeydown)="onOverlayKeydown($event)"
                 (detach)="close()">
      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-xl overflow-hidden">
        @if (filter()) {
          <div class="p-2 border-b border-surface-200 dark:border-surface-700">
            <input euiInput
                   type="text"
                   class="w-full"
                   [placeholder]="labels().search"
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
            <div class="px-3 py-4 text-center text-sm text-surface-400">{{ labels().noResultsFound }}</div>
          } @else {
            @for (opt of filteredOptions(); track $index) {
              <button type="button"
                      class="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-surface-900 dark:text-surface-0 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                      (click)="toggleOption(opt, $event)">
                <span
                  class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 text-white {{ isSelected(opt) ? 'border-transparent bg-gradient-to-br from-primary-600 to-accent-600' : 'border-surface-300 dark:border-surface-600' }}">
                  @if (isSelected(opt)) {
                    <svg lucideCheck [size]="10" [strokeWidth]="4"></svg>
                  }
                </span>
                <span class="truncate">{{ getLabel(opt) }}</span>
              </button>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class MultiSelect implements ControlValueAccessor {
  protected readonly labels = inject(EUI_LABELS);
  public readonly options = input<any[]>([]);
  public readonly optionLabel = input<string>();
  public readonly optionValue = input<string>();
  public readonly filter = input(false);
  public readonly filterBy = input<string>();
  public readonly showClear = input(false);
  public readonly loading = input(false);
  public readonly placeholder = input<string>('');
  public readonly maxSelectedLabels = input<number>();

  protected readonly positions = DROPDOWN_POSITIONS;
  protected readonly open = signal(false);
  protected readonly filterText = signal('');
  protected readonly panelWidth = signal<number>(0);

  protected readonly selectedValues = signal<any[]>([]);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.cvaDisabled());

  private readonly trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');

  private onChange: (value: any[]) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hasValue = computed(() => this.selectedValues().length > 0);

  protected readonly isCollapsed = computed(() => {
    const max = this.maxSelectedLabels();
    return max != null && this.selectedValues().length > max;
  });

  protected readonly selectedOptions = computed(() =>
    this.selectedValues()
      .map((val) => this.options().find((opt) => this.getValue(opt) === val))
      .filter((opt) => opt !== undefined),
  );

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
    return this.selectedValues().includes(this.getValue(opt));
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

  protected toggleOption(opt: any, event: Event): void {
    event.stopPropagation();
    const value = this.getValue(opt);
    const current = this.selectedValues();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.selectedValues.set(next);
    this.onChange(next);
  }

  protected removeItem(opt: any, event: Event): void {
    event.stopPropagation();
    const value = this.getValue(opt);
    const next = this.selectedValues().filter((v) => v !== value);
    this.selectedValues.set(next);
    this.onChange(next);
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.selectedValues.set([]);
    this.onChange([]);
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

  public writeValue(value: any[] | null): void {
    this.selectedValues.set(Array.isArray(value) ? value : []);
  }

  public registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
