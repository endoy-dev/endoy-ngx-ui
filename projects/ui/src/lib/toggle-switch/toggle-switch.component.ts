import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'eui-toggle-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitch),
      multi: true,
    },
  ],
  template: `
    <label class="relative inline-flex items-center align-middle"
           [class.cursor-pointer]="!isDisabled()"
           [class.cursor-not-allowed]="isDisabled()"
           [class.opacity-50]="isDisabled()">
      <input type="checkbox"
             class="sr-only peer"
             [attr.id]="inputId()"
             [checked]="checked()"
             [disabled]="isDisabled()"
             (change)="onSwitchChange($event)"
             (blur)="onTouched()"/>
      <span
        class="block w-11 h-6 rounded-full bg-surface-300 dark:bg-surface-700 transition-colors duration-200 peer-checked:bg-gradient-to-r peer-checked:from-primary-600 peer-checked:to-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 dark:peer-focus-visible:ring-primary-400/50"></span>
      <span
        class="pointer-events-none absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5"></span>
    </label>
  `,
})
export class ToggleSwitch implements ControlValueAccessor {
  public readonly disabled = input(false);
  public readonly inputId = input<string>();

  protected readonly checked = signal(false);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onSwitchChange(event: Event): void {
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
