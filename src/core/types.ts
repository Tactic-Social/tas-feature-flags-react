import type { ReactNode } from 'react';

export type FeatureFlags = Record<string, any>;

export type UserOverrides = Record<string, Record<string, any>>;

export interface FeatureFlagContextValue {
  flags: FeatureFlags;
  getFeatureValue: <T = any>(key: string) => T | undefined;
  isFeatureEnabled: (key: string, value?: any) => boolean;
  getFeatureValueForUser: <T = any>(userId: string, key: string) => T | undefined;
  isFeatureEnabledForUser: (userId: string, key: string, value?: any) => boolean;
}

export interface FeatureFlagProviderProps {
  children: ReactNode;
  config: Record<string, any>;
  userOverrides?: UserOverrides;
}
