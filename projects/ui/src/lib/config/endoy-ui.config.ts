import { EnvironmentProviders, makeEnvironmentProviders, Provider } from '@angular/core';
import { EuiLabelsSource, provideEuiLabels } from '../i18n/ui-labels';

export interface EndoyUIConfig {
  labels?: EuiLabelsSource | (() => EuiLabelsSource);
}

export function provideEndoyUI(config: EndoyUIConfig = {}): EnvironmentProviders {
  const providers: Provider[] = [];

  if (config.labels) {
    providers.push(provideEuiLabels(config.labels));
  }

  return makeEnvironmentProviders(providers);
}
