import { useCallback, useMemo } from 'react';
import { FeatureFlagContext } from './context';
import { flattenConfig } from './core/flatten';
import type { FeatureFlags, FeatureFlagProviderProps } from './core/types';

function resolveUserFlagValue(
  key: string,
  userId: string,
  flattenedUserOverrides: Record<string, FeatureFlags>,
  globalFlags: FeatureFlags
): any {
  const userFlags = flattenedUserOverrides[userId];

  if (userFlags && key in userFlags) {
    return userFlags[key];
  }

  return globalFlags[key];
}

export function FeatureFlagProvider({
  children,
  config,
  userOverrides,
}: FeatureFlagProviderProps) {
  const flags = useMemo<FeatureFlags>(
    () => flattenConfig(config),
    [config]
  );

  const flattenedUserOverrides = useMemo<Record<string, FeatureFlags>>(() => {
    if (!userOverrides) return {};

    const result: Record<string, FeatureFlags> = {};
    for (const userId of Object.keys(userOverrides)) {
      const userConfig = userOverrides[userId];
      if (userConfig) {
        result[userId] = flattenConfig(userConfig);
      }
    }
    return result;
  }, [userOverrides]);

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

  const getFeatureValueForUser = useCallback(
    <T = any>(userId: string, key: string): T | undefined => {
      return resolveUserFlagValue(key, userId, flattenedUserOverrides, flags) as T | undefined;
    },
    [flags, flattenedUserOverrides]
  );

  const isFeatureEnabledForUser = useCallback(
    (userId: string, key: string, value?: any): boolean => {
      const flagValue = resolveUserFlagValue(key, userId, flattenedUserOverrides, flags);

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
    [flags, flattenedUserOverrides]
  );

  const contextValue = useMemo(
    () => ({
      flags,
      getFeatureValue,
      isFeatureEnabled,
      getFeatureValueForUser,
      isFeatureEnabledForUser,
    }),
    [flags, getFeatureValue, isFeatureEnabled, getFeatureValueForUser, isFeatureEnabledForUser]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
