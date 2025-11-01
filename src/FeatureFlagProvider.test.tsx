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
