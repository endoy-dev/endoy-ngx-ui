import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'eui-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class Stepper {
  public readonly linear = input(true);
  public readonly value = model<number>(1);

  public goTo(step: number): void {
    this.value.set(step);
  }
}
