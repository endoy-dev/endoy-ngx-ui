import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { Input } from '../input/input.directive';
import { EUI_LABELS } from '../i18n/ui-labels';

@Component({
  selector: 'eui-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Input, LucideEye, LucideEyeOff],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Password),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <input euiInput
             class="w-full pr-10"
             [type]="visible() ? 'text' : 'password'"
             [placeholder]="placeholder()"
             [disabled]="isDisabled()"
             [value]="value()"
             (input)="onInput($event)"
             (blur)="onTouched()"/>

      @if (toggleMask()) {
        <button type="button"
                tabindex="-1"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                [attr.aria-label]="visible() ? labels().hidePassword : labels().showPassword"
                (click)="toggle()">
          @if (visible()) {
            <svg lucideEyeOff [size]="18" [strokeWidth]="1.75"></svg>
          } @else {
            <svg lucideEye [size]="18" [strokeWidth]="1.75"></svg>
          }
        </button>
      }
    </div>
  `,
})
export class Password implements ControlValueAccessor {
  protected readonly labels = inject(EUI_LABELS);
  public readonly placeholder = input<string>('');
  public readonly toggleMask = input(true);
  public readonly disabled = input(false);

  protected readonly value = signal<string>('');
  protected readonly visible = signal(false);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected toggle(): void {
    this.visible.update((v) => !v);
  }

  public writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
