import { useCallback, useMemo } from 'react';
import { FeatureFlagContext } from './context';
import { flattenConfig } from './core/flatten';
import type { FeatureFlags, FeatureFlagProviderProps } from './core/types';

export function FeatureFlagProvider({
  children,
  config,
}: FeatureFlagProviderProps) {
  const flags = useMemo<FeatureFlags>(
    () => flattenConfig(config),
    [config]
  );

  const getFeatureValue = useCallback(
    <T = any>(key: string): T | undefined => {
      return flags[key] as T | undefined;
    },
    [flags]
  );

  const isFeatureEnabled = useCallback(
    (key: string, value?: any): boolean => {
      const flagValue = flags[key];

      if (flagValue === undefined) {
        return false;
      }

      if (value !== undefined) {
        if (Array.isArray(flagValue)) {
          return flagValue.includes(value);
        }
        return flagValue === value;
      }

      return Boolean(flagValue);
    },
    [flags]
  );

  const contextValue = useMemo(
    () => ({
      flags,
      getFeatureValue,
      isFeatureEnabled,
    }),
    [flags, getFeatureValue, isFeatureEnabled]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
