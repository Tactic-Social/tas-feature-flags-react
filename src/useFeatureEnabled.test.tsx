import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from './FeatureFlagProvider';
import { useFeatureEnabled } from './useFeatureEnabled';

function TestComponent({ flagKey, value }: { flagKey: string; value?: any }) {
  const isEnabled = useFeatureEnabled(flagKey, value);
  return <div>{isEnabled ? 'enabled' : 'disabled'}</div>;
}

describe('useFeatureEnabled', () => {
  it('returns true for truthy boolean flags', () => {
    const config = { features: { auth: true } };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="features.auth" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('returns false for falsy boolean flags', () => {
    const config = { features: { auth: false } };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="features.auth" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('returns false for undefined flags', () => {
    const config = {};

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="nonexistent" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('returns true when value exists in array', () => {
    const config = { platforms: ['facebook', 'instagram', 'twitter'] };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="platforms" value="facebook" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('returns false when value does not exist in array', () => {
    const config = { platforms: ['facebook', 'instagram'] };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="platforms" value="twitter" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('checks exact value match for non-array flags', () => {
    const config = { mode: 'production' };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="mode" value="production" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('returns false when exact value does not match', () => {
    const config = { mode: 'production' };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="mode" value="development" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('treats truthy non-boolean values as enabled without value param', () => {
    const config = { count: 5, text: 'hello' };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="count" />
        <TestComponent flagKey="text" />
      </FeatureFlagProvider>
    );

    const enabled = screen.getAllByText('enabled');
    expect(enabled).toHaveLength(2);
  });

  it('treats 0 as falsy', () => {
    const config = { count: 0 };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="count" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('treats empty string as falsy', () => {
    const config = { text: '' };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="text" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      render(<TestComponent flagKey="test" />);
    }).toThrow('useFeatureEnabled must be used within <FeatureFlagProvider>');
  });

  it('works with nested config keys', () => {
    const config = {
      features: {
        social: {
          platforms: ['facebook', 'twitter'],
        },
      },
    };

    render(
      <FeatureFlagProvider config={config}>
        <TestComponent flagKey="features.social.platforms" value="facebook" />
      </FeatureFlagProvider>
    );

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });
});
