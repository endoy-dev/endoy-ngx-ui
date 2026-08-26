import {AfterContentInit, ChangeDetectionStrategy, Component, contentChild, ElementRef, inject, Renderer2,} from '@angular/core';
import {Input} from '../input/input.directive';

@Component({
  selector: 'eui-icon-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'block'},
  template: `
    <div class="relative w-full">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-surface-400 dark:text-surface-500 pointer-events-none z-10">
        <ng-content select="svg"/>
      </span>
      <ng-content/>
    </div>
  `,
})
export class IconField implements AfterContentInit {
  readonly renderer = inject(Renderer2);
  private readonly projectedInput = contentChild(Input, {read: ElementRef});

  public ngAfterContentInit(): void {
    const inputEl = this.projectedInput()?.nativeElement as HTMLElement | undefined;
    if (inputEl) {
      this.renderer.addClass(inputEl, 'pl-9');
    }
  }
}
