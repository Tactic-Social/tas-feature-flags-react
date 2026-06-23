import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureFlagProvider } from '../FeatureFlagProvider';
import { Flag } from './Flag';

describe('Flag component', () => {
  it('renders children when flag is enabled', () => {
    const config = { features: { auth: true } };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="features.auth">
          <div>Auth Content</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Auth Content')).toBeInTheDocument();
  });

  it('does not render children when flag is disabled', () => {
    const config = { features: { auth: false } };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="features.auth">
          <div>Auth Content</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.queryByText('Auth Content')).not.toBeInTheDocument();
  });

  it('does not render children when flag is undefined', () => {
    const config = {};

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="nonexistent">
          <div>Content</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders when value exists in array flag', () => {
    const config = { platforms: ['facebook', 'instagram'] };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="platforms" value="facebook">
          <div>Facebook Widget</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Facebook Widget')).toBeInTheDocument();
  });

  it('does not render when value does not exist in array flag', () => {
    const config = { platforms: ['facebook', 'instagram'] };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="platforms" value="twitter">
          <div>Twitter Widget</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.queryByText('Twitter Widget')).not.toBeInTheDocument();
  });

  it('supports nested flag components', () => {
    const config = {
      features: { social: true },
      platforms: ['facebook', 'instagram'],
    };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="features.social">
          <div>
            Social Features
            <Flag flag="platforms" value="facebook">
              <span>Facebook</span>
            </Flag>
            <Flag flag="platforms" value="twitter">
              <span>Twitter</span>
            </Flag>
          </div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Social Features')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });

  it('renders multiple children', () => {
    const config = { features: { analytics: true } };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="features.analytics">
          <div>Chart 1</div>
          <div>Chart 2</div>
          <div>Chart 3</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Chart 1')).toBeInTheDocument();
    expect(screen.getByText('Chart 2')).toBeInTheDocument();
    expect(screen.getByText('Chart 3')).toBeInTheDocument();
  });

  it('works with string values', () => {
    const config = { theme: 'dark' };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="theme" value="dark">
          <div>Dark Mode</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('works with number values', () => {
    const config = { version: 2 };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="version" value={2}>
          <div>Version 2 Features</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.getByText('Version 2 Features')).toBeInTheDocument();
  });

  it('renders nothing when flag is falsy without value param', () => {
    const config = { count: 0, empty: '' };

    render(
      <FeatureFlagProvider config={config}>
        <Flag flag="count">
          <div>Count Content</div>
        </Flag>
        <Flag flag="empty">
          <div>Empty Content</div>
        </Flag>
      </FeatureFlagProvider>
    );

    expect(screen.queryByText('Count Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty Content')).not.toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      render(
        <Flag flag="test">
          <div>Content</div>
        </Flag>
      );
    }).toThrow('useFeatureFlags must be used within <FeatureFlagProvider>');
  });

  describe('per-user overrides', () => {
    it('renders children when a user override enables a globally disabled flag', () => {
      const config = { features: { beta: false } };
      const userOverrides = { user1: { features: { beta: true } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <Flag flag="features.beta" userId="user1">
            <div>Beta Content</div>
          </Flag>
        </FeatureFlagProvider>
      );

      expect(screen.getByText('Beta Content')).toBeInTheDocument();
    });

    it('hides children when a user override disables a globally enabled flag', () => {
      const config = { features: { beta: true } };
      const userOverrides = { user1: { features: { beta: false } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <Flag flag="features.beta" userId="user1">
            <div>Beta Content</div>
          </Flag>
        </FeatureFlagProvider>
      );

      expect(screen.queryByText('Beta Content')).not.toBeInTheDocument();
    });

    it('falls back to global config when the user has no override for the key', () => {
      const config = { features: { auth: true } };
      const userOverrides = { user1: { features: { beta: true } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <Flag flag="features.auth" userId="user1">
            <div>Auth Content</div>
          </Flag>
        </FeatureFlagProvider>
      );

      expect(screen.getByText('Auth Content')).toBeInTheDocument();
    });

    it('falls back to global config when the userId is unknown', () => {
      const config = { features: { beta: true } };
      const userOverrides = { user1: { features: { beta: false } } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <Flag flag="features.beta" userId="unknown-user">
            <div>Beta Content</div>
          </Flag>
        </FeatureFlagProvider>
      );

      expect(screen.getByText('Beta Content')).toBeInTheDocument();
    });

    it('applies array value matching against the user override', () => {
      const config = { platforms: ['facebook'] };
      const userOverrides = { user1: { platforms: ['facebook', 'tiktok'] } };

      render(
        <FeatureFlagProvider config={config} userOverrides={userOverrides}>
          <Flag flag="platforms" value="tiktok" userId="user1">
            <div>TikTok Widget</div>
          </Flag>
          <Flag flag="platforms" value="tiktok">
            <div>Global TikTok Widget</div>
          </Flag>
        </FeatureFlagProvider>
      );

      expect(screen.getByText('TikTok Widget')).toBeInTheDocument();
      expect(screen.queryByText('Global TikTok Widget')).not.toBeInTheDocument();
    });
  });
});
