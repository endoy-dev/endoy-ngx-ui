import { ChangeDetectionStrategy, Component, contentChildren } from '@angular/core';
import { Step } from './step.component';

@Component({
  selector: 'eui-step-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full items-center">
      <ng-content />
    </div>
  `,
})
export class StepList {
  readonly steps = contentChildren(Step);
}
