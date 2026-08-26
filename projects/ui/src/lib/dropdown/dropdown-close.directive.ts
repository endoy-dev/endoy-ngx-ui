import { Directive, inject } from '@angular/core';
import { Dropdown } from './dropdown.component';

@Directive({
  selector: '[euiDropdownClose]',
  standalone: true,
  host: {
    '(click)': 'onClick()',
  },
})
export class DropdownClose {
  readonly dropdown = inject(Dropdown);

  protected onClick(): void {
    this.dropdown.close();
  }
}
