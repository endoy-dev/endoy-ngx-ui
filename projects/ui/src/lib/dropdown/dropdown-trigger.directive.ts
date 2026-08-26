import { Directive, inject } from '@angular/core';
import { Dropdown } from './dropdown.component';

@Directive({
  selector: '[euiDropdownTrigger]',
  standalone: true,
  host: {
    '[attr.aria-haspopup]': 'true',
    '[attr.aria-expanded]': 'dropdown.open()',
    '(click)': 'onClick()',
  },
})
export class DropdownTrigger {
  readonly dropdown = inject(Dropdown);

  protected onClick(): void {
    this.dropdown.toggle();
  }
}
