import { Directive } from '@angular/core';

@Directive({
  selector: 'input[euiInput], textarea[euiInput]',
  host: {
    class:
      'px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 ' +
      'bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-0 ' +
      'placeholder:text-surface-400 dark:placeholder:text-surface-500 ' +
      'transition-colors duration-150 ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-400/50 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed',
  },
})
export class Input {}
