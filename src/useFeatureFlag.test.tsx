import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureFlag } from './useFeatureFlag';

describe('useFeatureFlag', () => {
  it('returns the flag value when it exists', () => {
    function TestComponent() {
      const value = useFeatureFlag<boolean>('features.auth');
      return <div data-testid="result">{value ? 'true' : 'false'}</div>;
    }

    render(
      <FeatureFlagProvider config={{ features: { auth: true } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('true');
  });

  it('returns undefined when flag does not exist', () => {
    function TestComponent() {
      const value = useFeatureFlag<boolean>('nonExistent');
      return <div data-testid="result">{value === undefined ? 'undefined' : 'defined'}</div>;
    }

    render(
      <FeatureFlagProvider config={{}}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('undefined');
  });

  it('works with string values', () => {
    function TestComponent() {
      const theme = useFeatureFlag<string>('theme');
      return <div data-testid="result">{theme}</div>;
    }

    render(
      <FeatureFlagProvider config={{ theme: 'dark' }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('dark');
  });

  it('works with number values', () => {
    function TestComponent() {
      const count = useFeatureFlag<number>('limits.maxAccounts');
      return <div data-testid="result">{count}</div>;
    }

    render(
      <FeatureFlagProvider config={{ limits: { maxAccounts: 5 } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('5');
  });

  it('works with array values', () => {
    function TestComponent() {
      const platforms = useFeatureFlag<string[]>('platforms');
      return <div data-testid="result">{platforms?.join(',')}</div>;
    }

    render(
      <FeatureFlagProvider config={{ platforms: ['facebook', 'instagram'] }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('facebook,instagram');
  });

  it('works with nested config keys', () => {
    function TestComponent() {
      const oauth = useFeatureFlag<boolean>('features.auth.oauth');
      return <div data-testid="result">{oauth ? 'enabled' : 'disabled'}</div>;
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

    expect(screen.getByTestId('result').textContent).toBe('enabled');
  });

  it('throws error when used outside of FeatureFlagProvider', () => {
    function TestComponent() {
      const value = useFeatureFlag('myFeature');
      return <div>{value}</div>;
    }

    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useFeatureFlag must be used within <FeatureFlagProvider>');

    console.error = originalError;
  });

  it('updates when config changes', () => {
    function TestComponent() {
      const auth = useFeatureFlag<boolean>('features.auth');
      return <div data-testid="result">{auth ? 'enabled' : 'disabled'}</div>;
    }

    const { rerender } = render(
      <FeatureFlagProvider config={{ features: { auth: false } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('disabled');

    rerender(
      <FeatureFlagProvider config={{ features: { auth: true } }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('enabled');
  });

  it('works with multiple flags in same component', () => {
    function TestComponent() {
      const auth = useFeatureFlag<boolean>('features.auth');
      const analytics = useFeatureFlag<boolean>('features.analytics');
      return (
        <div>
          <div data-testid="auth">{auth ? 'enabled' : 'disabled'}</div>
          <div data-testid="analytics">{analytics ? 'enabled' : 'disabled'}</div>
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

    expect(screen.getByTestId('auth').textContent).toBe('enabled');
    expect(screen.getByTestId('analytics').textContent).toBe('disabled');
  });

  it('handles null values', () => {
    function TestComponent() {
      const value = useFeatureFlag('nullable');
      return <div data-testid="result">{value === null ? 'null' : 'not-null'}</div>;
    }

    render(
      <FeatureFlagProvider config={{ nullable: null }}>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('result').textContent).toBe('null');
  });
});
