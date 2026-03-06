import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureFlagForUser } from './useFeatureFlagForUser';

describe('useFeatureFlagForUser', () => {
  it('returns user-specific value when override exists', () => {
    function TestComponent() {
      const value = useFeatureFlagForUser<number>('user1', 'limits.maxAccounts');
      return <div data-testid="result">{value}</div>;
    }

    const config = { limits: { maxAccounts: 5 } };
    const userOverrides = { user1: { limits: { maxAccounts: 20 } } };

    render(
      <FeatureFlagProvider config={config} userOverrides={userOverrides}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('20');
  });

  it('falls back to global config when no override for user', () => {
    function TestComponent() {
      const value = useFeatureFlagForUser<number>('user1', 'limits.maxAccounts');
      return <div data-testid="result">{value}</div>;
    }

    const config = { limits: { maxAccounts: 5 } };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('5');
  });

  it('returns undefined for non-existent key', () => {
    function TestComponent() {
      const value = useFeatureFlagForUser('user1', 'nonexistent');
      return <div data-testid="result">{value === undefined ? 'undefined' : 'defined'}</div>;
    }

    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('undefined');
  });

  it('returns array values from user overrides', () => {
    function TestComponent() {
      const platforms = useFeatureFlagForUser<string[]>('user1', 'platforms');
      return <div data-testid="result">{platforms?.join(',')}</div>;
    }

    const config = { platforms: ['facebook'] };
    const userOverrides = { user1: { platforms: ['twitter', 'linkedin'] } };

    render(
      <FeatureFlagProvider config={config} userOverrides={userOverrides}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('twitter,linkedin');
  });

  it('throws error when used outside of FeatureFlagProvider', () => {
    function TestComponent() {
      const value = useFeatureFlagForUser('user1', 'test');
      return <div>{value}</div>;
    }

    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useFeatureFlagForUser must be used within <FeatureFlagProvider>');

    console.error = originalError;
  });
});
