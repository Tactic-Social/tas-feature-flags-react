import { useContext } from 'react';
import { FeatureFlagContext } from './context';

export function useFeatureFlag<T = any>(key: string): T | undefined {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureFlag must be used within <FeatureFlagProvider>. ' +
      'Wrap your app with <FeatureFlagProvider config={...}>'
    );
  }

  return context.getFeatureValue<T>(key);
}
