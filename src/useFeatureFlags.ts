import { useContext } from 'react';
import { FeatureFlagContext } from './context';
import type { FeatureFlagContextValue } from './core/types';

export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureFlags must be used within <FeatureFlagProvider>. ' +
      'Wrap your app with <FeatureFlagProvider config={...}>'
    );
  }

  return context;
}
