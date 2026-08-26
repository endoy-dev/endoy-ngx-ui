import { ChangeDetectionStrategy, Component, contentChild, inject, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Stepper } from './stepper.component';

@Component({
  selector: 'eui-step-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    @if (active() && contentTemplate()) {
      <ng-container [ngTemplateOutlet]="contentTemplate()!" />
    }
  `,
})
export class StepPanel {
  readonly stepper = inject(Stepper);

  public readonly value = input.required<number>();

  protected readonly contentTemplate = contentChild<TemplateRef<unknown>>('content');

  protected active(): boolean {
    return this.stepper.value() === this.value();
  }
}
