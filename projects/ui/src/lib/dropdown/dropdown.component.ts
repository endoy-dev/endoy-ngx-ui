import { CdkOverlayOrigin, ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input, model, TemplateRef } from '@angular/core';

export type DropdownPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

const POSITIONS: Record<DropdownPosition, ConnectedPosition> = {
  'bottom-start': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
  'bottom-end': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
  'top-start': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
  'top-end': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
};

@Component({
  selector: 'eui-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OverlayModule, NgTemplateOutlet],
  host: { class: 'inline-block' },
  template: `
    <ng-content select="[euiDropdownTrigger]"/>

    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="origin()!"
                 [cdkConnectedOverlayOpen]="open()"
                 [cdkConnectedOverlayPositions]="positions()"
                 (overlayOutsideClick)="close()"
                 (overlayKeydown)="onOverlayKeydown($event)"
                 (detach)="close()">
      <div class="min-w-56 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-xl dark:border-surface-800 dark:bg-surface-900">
        <ng-container [ngTemplateOutlet]="panelTemplate() ?? null"/>
      </div>
    </ng-template>
  `,
})
export class Dropdown {
  public readonly open = model(false);
  public readonly position = input<DropdownPosition>('bottom-end');

  protected readonly origin = contentChild(CdkOverlayOrigin);
  protected readonly panelTemplate = contentChild<TemplateRef<unknown>>('panel');

  protected readonly positions = computed(() => {
    const primary = POSITIONS[this.position()];
    return [primary, ...Object.values(POSITIONS).filter((candidate) => candidate !== primary)];
  });

  public toggle(): void {
    this.open.update((value) => !value);
  }

  public close(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}
