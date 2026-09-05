import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { LucideChevronRight, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'eui-collapsible',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  host: {
    class: 'block',
  },
  template: `
    <div class="flex items-center gap-2">
      <button type="button"
              class="flex flex-1 items-center gap-2 py-3 text-left"
              [class.cursor-pointer]="!disabled()"
              [class.cursor-not-allowed]="disabled()"
              [class.opacity-50]="disabled()"
              [disabled]="disabled()"
              [attr.aria-expanded]="expanded()"
              (click)="toggle()">
        <svg [lucideIcon]="chevronIcon"
             [size]="16"
             class="shrink-0 transition-transform duration-200"
             [class.rotate-90]="expanded()"></svg>

        @if (header()) {
          <span class="font-medium">{{ header() }}</span>
        }
        <ng-content select="[euiCollapsibleHeader]" />
      </button>

      <ng-content select="[euiCollapsibleActions]" />
    </div>

    @if (expanded()) {
      <div class="pb-4 pl-6">
        <ng-content />
      </div>
    }
  `,
})
export class Collapsible {
  public readonly expanded = model<boolean>(false);
  public readonly header = input<string>();
  public readonly disabled = input(false);

  protected readonly chevronIcon = LucideChevronRight;

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.expanded.update((expanded) => !expanded);
  }
}
