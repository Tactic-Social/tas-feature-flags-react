import type { ReactNode } from 'react';
import { useFeatureFlags } from '../useFeatureFlags';

interface FlagProps {
  flag: string;
  value?: any;
  /**
   * When provided, the flag is resolved using that user's overrides,
   * falling back to the global config when the user has no override for it.
   * When omitted, the global config is used.
   */
  userId?: string;
  children: ReactNode;
}

export function Flag({ flag, value, userId, children }: FlagProps) {
  const { isFeatureEnabled, isFeatureEnabledForUser } = useFeatureFlags();

  const isEnabled =
    userId !== undefined
      ? isFeatureEnabledForUser(userId, flag, value)
      : isFeatureEnabled(flag, value);

  if (!isEnabled) {
    return null;
  }

  return <>{children}</>;
}
