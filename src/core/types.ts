import type { ReactNode } from 'react';

export type FeatureFlags = Record<string, any>;

export interface FeatureFlagContextValue {
  flags: FeatureFlags;
  getFeatureValue: <T = any>(key: string) => T | undefined;
  isFeatureEnabled: (key: string, value?: any) => boolean;
}

export interface FeatureFlagProviderProps {
  children: ReactNode;
  config: Record<string, any>;
}
