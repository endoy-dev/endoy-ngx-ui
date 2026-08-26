import {ConnectedPosition, Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, Component, Directive, ElementRef, inject, input, OnDestroy,} from '@angular/core';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

const POSITIONS: Record<TooltipPosition, ConnectedPosition> = {
  top: {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8},
  bottom: {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8},
  left: {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8},
  right: {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8},
};

@Component({
  selector: 'eui-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface-900 text-surface-0 dark:bg-surface-0 dark:text-surface-900 text-xs px-2 py-1 rounded shadow-lg max-w-xs pointer-events-none">
      {{ text }}
    </div>
  `,
})
export class TooltipContent {
  text = '';
}

@Directive({
  selector: '[euiTooltip]',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class Tooltip implements OnDestroy {
  public readonly euiTooltip = input<string>('');
  public readonly tooltipPosition = input<TooltipPosition>('top');

  readonly overlay = inject(Overlay);
  readonly positionBuilder = inject(OverlayPositionBuilder);
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private overlayRef: OverlayRef | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  protected scheduleShow(): void {
    this.clearTimer();
    this.showTimer = setTimeout(() => this.show(), 300);
  }

  protected show(): void {
    const text = this.euiTooltip();
    if (!text || this.overlayRef?.hasAttached()) {
      return;
    }

    if (!this.overlayRef) {
      const positionStrategy = this.positionBuilder
        .flexibleConnectedTo(this.host)
        .withPositions([POSITIONS[this.tooltipPosition()], POSITIONS.top, POSITIONS.bottom]);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.close(),
      });
    }

    const ref = this.overlayRef.attach(new ComponentPortal(TooltipContent));
    ref.instance.text = text;
    ref.changeDetectorRef.detectChanges();
  }

  protected hide(): void {
    this.clearTimer();
    this.overlayRef?.detach();
  }

  private clearTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  public ngOnDestroy(): void {
    this.clearTimer();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
