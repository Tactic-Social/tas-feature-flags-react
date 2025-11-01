import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureFlags } from './useFeatureFlags';

describe('useFeatureFlags', () => {
  it('returns all flattened flags', () => {
    function TestComponent() {
      const { flags } = useFeatureFlags();
      return <div data-testid="flags">{JSON.stringify(flags)}</div>;
    }

    const config = {
      features: {
        auth: true,
        analytics: false,
      },
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    const expected = {
      'features.auth': true,
      'features.analytics': false,
    };

    expect(screen.getByTestId('flags').textContent).toBe(
      JSON.stringify(expected)
    );
  });

  it('provides getFeatureValue function', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const platforms = getFeatureValue<string[]>('platforms');
      return <div data-testid="result">{platforms?.join(',')}</div>;
    }

    render(
      <FeatureFlagProvider config={{ platforms: ['facebook', 'instagram'] }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe(
      'facebook,instagram'
    );
  });

  it('provides isFeatureEnabled function', () => {
    function TestComponent() {
      const { isFeatureEnabled } = useFeatureFlags();
      return (
        <div>
          <div data-testid="auth">
            {isFeatureEnabled('features.auth') ? 'On' : 'Off'}
          </div>
          <div data-testid="analytics">
            {isFeatureEnabled('features.analytics') ? 'On' : 'Off'}
          </div>
        </div>
      );
    }

    render(
      <FeatureFlagProvider
        config={{
          features: {
            auth: true,
            analytics: false,
          },
        }}
      >
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('On');
    expect(screen.getByTestId('analytics').textContent).toBe('Off');
  });

  it('isFeatureEnabled works with array value checking', () => {
    function TestComponent() {
      const { isFeatureEnabled } = useFeatureFlags();
      return (
        <div>
          <div data-testid="hasFacebook">
            {isFeatureEnabled('platforms', 'facebook') ? 'Yes' : 'No'}
          </div>
          <div data-testid="hasTwitter">
            {isFeatureEnabled('platforms', 'twitter') ? 'Yes' : 'No'}
          </div>
        </div>
      );
    }

    render(
      <FeatureFlagProvider config={{ platforms: ['facebook', 'instagram'] }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('hasFacebook').textContent).toBe('Yes');
    expect(screen.getByTestId('hasTwitter').textContent).toBe('No');
  });

  it('throws error when used outside of FeatureFlagProvider', () => {
    function TestComponent() {
      const { flags } = useFeatureFlags();
      return <div>{JSON.stringify(flags)}</div>;
    }

    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useFeatureFlags must be used within <FeatureFlagProvider>');

    console.error = originalError;
  });

  it('provides access to nested config values', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const oauth = getFeatureValue<boolean>('features.auth.oauth');
      const maxAccounts = getFeatureValue<number>('limits.maxAccounts');

      return (
        <div>
          <div data-testid="oauth">{oauth ? 'true' : 'false'}</div>
          <div data-testid="max">{maxAccounts}</div>
        </div>
      );
    }

    const config = {
      features: {
        auth: {
          oauth: true,
        },
      },
      limits: {
        maxAccounts: 5,
      },
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('oauth').textContent).toBe('true');
    expect(screen.getByTestId('max').textContent).toBe('5');
  });

  it('returns undefined for non-existent flags', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const value = getFeatureValue('nonExistent');
      return (
        <div data-testid="result">
          {value === undefined ? 'undefined' : 'defined'}
        </div>
      );
    }

    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('undefined');
  });

  it('handles config updates correctly', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const auth = getFeatureValue<boolean>('features.auth');
      return <div data-testid="auth">{auth ? 'enabled' : 'disabled'}</div>;
    }

    const { rerender } = render(
      <FeatureFlagProvider config={{ features: { auth: false } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('disabled');

    rerender(
      <FeatureFlagProvider config={{ features: { auth: true } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('enabled');
  });
});
