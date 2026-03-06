import { useContext } from 'react';
import { FeatureFlagContext } from './context';

export function useFeatureEnabledForUser(userId: string, key: string, value?: any): boolean {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      'useFeatureEnabledForUser must be used within <FeatureFlagProvider>. ' +
      'Wrap your app with <FeatureFlagProvider config={...}>'
    );
  }

  return context.isFeatureEnabledForUser(userId, key, value);
}
