import { useContext } from 'react';
import { FeatureFlagContext } from './context';

export function useFeatureEnabled(key: string, value?: any): boolean {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureEnabled must be used within <FeatureFlagProvider>. ' +
      'Wrap your app with <FeatureFlagProvider config={...}>'
    );
  }

  return context.isFeatureEnabled(key, value);
}
