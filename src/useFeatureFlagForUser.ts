import { useContext } from 'react';
import { FeatureFlagContext } from './context';

export function useFeatureFlagForUser<T = any>(userId: string, key: string): T | undefined {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureFlagForUser must be used within <FeatureFlagProvider>. ' +
      'Wrap your app with <FeatureFlagProvider config={...}>'
    );
  }

  return context.getFeatureValueForUser<T>(userId, key);
}
