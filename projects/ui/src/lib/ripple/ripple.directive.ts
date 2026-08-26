import { Directive, ElementRef, inject, NgZone, Renderer2 } from '@angular/core';

@Directive({
  selector: '[euiRipple]',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class Ripple {
  readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly renderer = inject(Renderer2);
  readonly zone = inject(NgZone);

  protected onPointerDown(event: PointerEvent): void {
    const host = this.el.nativeElement;

    if (getComputedStyle(host).position === 'static') {
      this.renderer.setStyle(host, 'position', 'relative');
    }
    this.renderer.setStyle(host, 'overflow', 'hidden');

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = this.renderer.createElement('span') as HTMLElement;
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'left', `${x}px`);
    this.renderer.setStyle(ripple, 'top', `${y}px`);
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'borderRadius', '50%');
    this.renderer.setStyle(ripple, 'pointerEvents', 'none');
    this.renderer.setStyle(ripple, 'background', 'currentColor');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.appendChild(host, ripple);

    this.zone.runOutsideAngular(() => {
      const animation = ripple.animate(
        [
          { transform: 'scale(0)', opacity: 0.35 },
          { transform: 'scale(2.4)', opacity: 0 },
        ],
        { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      );
      animation.onfinish = () => {
        if (ripple.parentNode) {
          this.renderer.removeChild(host, ripple);
        }
      };
    });
  }
}
