import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureEnabledForUser } from './useFeatureEnabledForUser';

function TestComponent({ userId, flagKey, value }: { userId: string; flagKey: string; value?: any }) {
  const isEnabled = useFeatureEnabledForUser(userId, flagKey, value);
  return <div>{isEnabled ? 'enabled' : 'disabled'}</div>;
}

describe('useFeatureEnabledForUser', () => {
  it('returns true when user override enables flag', () => {
    const config = { features: { beta: false } };
    const userOverrides = { user1: { features: { beta: true } } };

    render(
      <FeatureFlagProvider config={config} userOverrides={userOverrides}>
        <TestComponent userId="user1" flagKey="features.beta" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('returns false when user override disables flag', () => {
    const config = { features: { auth: true } };
    const userOverrides = { user1: { features: { auth: false } } };

    render(
      <FeatureFlagProvider config={config} userOverrides={userOverrides}>
        <TestComponent userId="user1" flagKey="features.auth" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('falls back to global config when no override for user', () => {
    const config = { features: { auth: true } };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent userId="user1" flagKey="features.auth" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('checks array membership with value param', () => {
    const config = { platforms: ['facebook'] };
    const userOverrides = { user1: { platforms: ['twitter', 'linkedin'] } };

    render(
      <FeatureFlagProvider config={config} userOverrides={userOverrides}>
        <TestComponent userId="user1" flagKey="platforms" value="twitter" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('returns false for non-existent flags', () => {
    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent userId="user1" flagKey="nonexistent" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent userId="user1" flagKey="test" />);
    }).toThrow('useFeatureEnabledForUser must be used within <FeatureFlagProvider>');

    console.error = originalError;
  });
});
