import { createContext } from 'react';
import type { FeatureFlagContextValue } from './core/types';

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(
  null
);

FeatureFlagContext.displayName = 'FeatureFlagContext';
