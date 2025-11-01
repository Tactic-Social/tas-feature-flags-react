import type { ReactNode } from 'react';
import { useFeatureEnabled } from '../useFeatureEnabled';

interface FlagProps {
  flag: string;
  value?: any;
  children: ReactNode;
}

export function Flag({ flag, value, children }: FlagProps) {
  const isEnabled = useFeatureEnabled(flag, value);

  if (!isEnabled) {
    return null;
  }

  return <>{children}</>;
}
