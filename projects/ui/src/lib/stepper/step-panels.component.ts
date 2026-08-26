import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'eui-step-panels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mt-6">
      <ng-content />
    </div>
  `,
})
export class StepPanels {}
