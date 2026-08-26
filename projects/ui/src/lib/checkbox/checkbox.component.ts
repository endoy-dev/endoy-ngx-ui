import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';

@Component({
  selector: 'eui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideCheck],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Checkbox),
      multi: true,
    },
  ],
  template: `
    <label class="inline-flex items-center"
           [class.cursor-pointer]="!isDisabled()"
           [class.cursor-not-allowed]="isDisabled()"
           [class.opacity-50]="isDisabled()">
      <input type="checkbox"
             class="sr-only peer"
             [attr.id]="inputId()"
             [attr.name]="name()"
             [checked]="checked()"
             [disabled]="isDisabled()"
             (change)="onCheckboxChange($event)"
             (blur)="onTouched()"/>
      <span
        class="w-5 h-5 rounded-md border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center transition-colors duration-150 text-white peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-primary-600 peer-checked:to-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 dark:peer-focus-visible:ring-primary-400/50">
        @if (checked()) {
          <svg lucideCheck [size]="14" [strokeWidth]="3"></svg>
        }
      </span>
    </label>
  `,
})
export class Checkbox implements ControlValueAccessor {
  public readonly binary = input(true);
  public readonly disabled = input(false);
  public readonly inputId = input<string>();
  public readonly name = input<string>();

  protected readonly checked = signal(false);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.checked.set(checked);
    this.onChange(checked);
  }

  public writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  public registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
