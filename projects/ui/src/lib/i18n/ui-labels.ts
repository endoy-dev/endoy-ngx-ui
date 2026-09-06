import { computed, InjectionToken, isSignal, Provider, signal, Signal } from '@angular/core';

export interface EuiLabels {
  cancel: string;
  clear: string;
  closeDialog: string;
  confirm: string;
  confirmDeletionHeader: string;
  confirmHeader: string;
  datePlaceholder: string;
  dismissNotification: string;
  hidePassword: string;
  loading: string;
  monthNames: string[];
  nextMonth: string;
  nextPage: string;
  noResultsFound: string;
  previousMonth: string;
  previousPage: string;
  remove: string;
  rowsPerPage: string;
  search: string;
  showPassword: string;
  weekdayNames: string[];
}

export const DEFAULT_EUI_LABELS: EuiLabels = {
  cancel: 'Cancel',
  clear: 'Clear',
  closeDialog: 'Close dialog',
  confirm: 'Confirm',
  confirmDeletionHeader: 'Confirm deletion',
  confirmHeader: 'Please confirm',
  datePlaceholder: 'dd/mm/yyyy',
  dismissNotification: 'Dismiss notification',
  hidePassword: 'Hide password',
  loading: 'Loading',
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  nextMonth: 'Next month',
  nextPage: 'Next page',
  noResultsFound: 'No results found',
  previousMonth: 'Previous month',
  previousPage: 'Previous page',
  remove: 'Remove',
  rowsPerPage: 'Rows per page',
  search: 'Search',
  showPassword: 'Show password',
  weekdayNames: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

export const EUI_LABELS = new InjectionToken<Signal<EuiLabels>>('EUI_LABELS', {
  providedIn: 'root',
  factory: () => signal(DEFAULT_EUI_LABELS).asReadonly(),
});

export type EuiLabelsSource = Partial<EuiLabels> | Signal<Partial<EuiLabels>>;

export function provideEuiLabels(labels: EuiLabelsSource | (() => EuiLabelsSource)): Provider {
  return {
    provide: EUI_LABELS,
    useFactory: () => {
      const resolved = typeof labels === 'function' && !isSignal(labels) ? labels() : labels;
      const source = isSignal(resolved) ? resolved : signal(resolved).asReadonly();

      return computed(() => ({ ...DEFAULT_EUI_LABELS, ...source() }));
    },
  };
}
