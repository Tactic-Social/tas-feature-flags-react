import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureFlags } from './useFeatureFlags';

describe('FeatureFlagProvider', () => {
  it('renders children', () => {
    render(
      <FeatureFlagProvider config={{}}>
        <div>Test Child</div>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('provides empty flags when empty config is provided', () => {
    function TestComponent() {
      const { flags } = useFeatureFlags();
      return <div>{JSON.stringify(flags)}</div>;
    }

    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('{}')).toBeInTheDocument();
  });

  it('flattens nested config into dotted keys', () => {
    function TestComponent() {
      const { flags } = useFeatureFlags();
      return <div data-testid="flags">{JSON.stringify(flags)}</div>;
    }

    const config = {
      features: {
        auth: true,
        analytics: false,
      },
      platforms: ['facebook', 'instagram'],
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    const expected = {
      'features.auth': true,
      'features.analytics': false,
      platforms: ['facebook', 'instagram'],
    };

    const flagsElement = screen.getByTestId('flags');
    expect(flagsElement.textContent).toBe(JSON.stringify(expected));
  });

  it('provides getFeatureValue to retrieve any value', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const platforms = getFeatureValue<string[]>('platforms');
      return <div data-testid="result">{platforms?.join(',')}</div>;
    }

    const config = {
      platforms: ['facebook', 'instagram'],
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe(
      'facebook,instagram'
    );
  });

  it('provides isFeatureEnabled for boolean checks', () => {
    function TestComponent() {
      const { isFeatureEnabled } = useFeatureFlags();
      return (
        <div>
          <div data-testid="auth">
            {isFeatureEnabled('features.auth') ? 'Enabled' : 'Disabled'}
          </div>
          <div data-testid="analytics">
            {isFeatureEnabled('features.analytics') ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      );
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

    expect(screen.getByTestId('auth').textContent).toBe('Enabled');
    expect(screen.getByTestId('analytics').textContent).toBe('Disabled');
  });

  it('isFeatureEnabled returns false for non-existent flags', () => {
    function TestComponent() {
      const { isFeatureEnabled } = useFeatureFlags();
      return (
        <div data-testid="result">
          {isFeatureEnabled('nonExistent') ? 'Enabled' : 'Disabled'}
        </div>
      );
    }

    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('Disabled');
  });

  it('isFeatureEnabled checks array membership with value param', () => {
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

    const config = {
      platforms: ['facebook', 'instagram'],
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('hasFacebook').textContent).toBe('Yes');
    expect(screen.getByTestId('hasTwitter').textContent).toBe('No');
  });

  it('handles deeply nested config', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const oauth = getFeatureValue<boolean>('features.auth.oauth');
      return <div data-testid="oauth">{oauth ? 'true' : 'false'}</div>;
    }

    const config = {
      features: {
        auth: {
          oauth: true,
        },
      },
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('oauth').textContent).toBe('true');
  });

  it('re-flattens config when config prop changes', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const auth = getFeatureValue<boolean>('features.auth');
      return <div data-testid="auth">{auth ? 'Enabled' : 'Disabled'}</div>;
    }

    const initialConfig = { features: { auth: false } };
    const { rerender } = render(
      <FeatureFlagProvider config={initialConfig}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('Disabled');

    const newConfig = { features: { auth: true } };
    rerender(
      <FeatureFlagProvider config={newConfig}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('auth').textContent).toBe('Enabled');
  });

  describe('userOverrides', () => {
    it('user override takes precedence over config', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div data-testid="result">
            {isFeatureEnabledForUser('user1', 'features.auth') ? 'Enabled' : 'Disabled'}
          </div>
        );
      }

      const config = { features: { auth: false } };
      const userOverrides = { user1: { features: { auth: true } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('user override can add new keys not in config', () => {
      function TestComponent() {
        const { getFeatureValueForUser } = useFeatureFlags();
        const beta = getFeatureValueForUser<boolean>('user1', 'features.beta');
        return <div data-testid="result">{beta ? 'Enabled' : 'Disabled'}</div>;
      }

      const config = { features: { auth: true } };
      const userOverrides = { user1: { features: { beta: true } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('falls back to global config when user has no override for key', () => {
      function TestComponent() {
        const { getFeatureValueForUser } = useFeatureFlags();
        const auth = getFeatureValueForUser<boolean>('user1', 'features.auth');
        return <div data-testid="result">{auth ? 'Enabled' : 'Disabled'}</div>;
      }

      const config = { features: { auth: true } };
      const userOverrides = { user1: { features: { beta: false } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('falls back to global config for unknown userId', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div data-testid="result">
            {isFeatureEnabledForUser('unknownUser', 'features.auth') ? 'Enabled' : 'Disabled'}
          </div>
        );
      }

      const config = { features: { auth: true } };
      const userOverrides = { user1: { features: { auth: false } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('works when userOverrides is undefined', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div data-testid="result">
            {isFeatureEnabledForUser('user1', 'features.auth') ? 'Enabled' : 'Disabled'}
          </div>
        );
      }

      render(
        <FeatureFlagProvider config={{ features: { auth: true } }}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('flattens nested user overrides', () => {
      function TestComponent() {
        const { getFeatureValueForUser } = useFeatureFlags();
        const oauth = getFeatureValueForUser<boolean>('user1', 'features.auth.oauth');
        return <div data-testid="result">{oauth ? 'true' : 'false'}</div>;
      }

      const config = { features: { auth: { oauth: false } } };
      const userOverrides = { user1: { features: { auth: { oauth: true } } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('true');
    });

    it('re-computes when userOverrides prop changes', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div data-testid="result">
            {isFeatureEnabledForUser('user1', 'features.beta') ? 'Enabled' : 'Disabled'}
          </div>
        );
      }

      const config = { features: { beta: false } };

      const { rerender } = render(
        <FeatureFlagProvider config={config} userOverrides={{}}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Disabled');

      rerender(
        <FeatureFlagProvider config={config} userOverrides={{ user1: { features: { beta: true } } }}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('result').textContent).toBe('Enabled');
    });

    it('user overrides work with array values', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div>
            <div data-testid="facebook">
              {isFeatureEnabledForUser('user1', 'platforms', 'facebook') ? 'Yes' : 'No'}
            </div>
            <div data-testid="twitter">
              {isFeatureEnabledForUser('user1', 'platforms', 'twitter') ? 'Yes' : 'No'}
            </div>
          </div>
        );
      }

      const config = { platforms: ['facebook', 'instagram'] };
      const userOverrides = { user1: { platforms: ['twitter'] } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('facebook').textContent).toBe('No');
      expect(screen.getByTestId('twitter').textContent).toBe('Yes');
    });

    it('supports multiple users with different overrides', () => {
      function TestComponent() {
        const { isFeatureEnabledForUser } = useFeatureFlags();
        return (
          <div>
            <div data-testid="user1">
              {isFeatureEnabledForUser('user1', 'features.beta') ? 'Enabled' : 'Disabled'}
            </div>
            <div data-testid="user2">
              {isFeatureEnabledForUser('user2', 'features.beta') ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        );
      }

      const config = { features: { beta: false } };
      const userOverrides = {
        user1: { features: { beta: true } },
        user2: { features: { beta: false } },
      };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <TestComponent />
        </FeatureFlagProvider>
      );

      expect(screen.getByTestId('user1').textContent).toBe('Enabled');
      expect(screen.getByTestId('user2').textContent).toBe('Disabled');
    });
  });

  it('supports various value types', () => {
    function TestComponent() {
      const { getFeatureValue } = useFeatureFlags();
      const count = getFeatureValue<number>('count');
      const message = getFeatureValue<string>('message');
      const items = getFeatureValue<string[]>('items');

      return (
        <div>
          <div data-testid="count">{count}</div>
          <div data-testid="message">{message}</div>
          <div data-testid="items">{items?.join(',')}</div>
        </div>
      );
    }

    const config = {
      count: 42,
      message: 'hello',
      items: ['a', 'b', 'c'],
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('42');
    expect(screen.getByTestId('message').textContent).toBe('hello');
    expect(screen.getByTestId('items').textContent).toBe('a,b,c');
  });
});
