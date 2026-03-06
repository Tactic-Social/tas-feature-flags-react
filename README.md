# @tactic-social/tas-feature-flags-react

A lightweight, type-safe feature flag library for React applications with zero dependencies. Built and maintained by [Tactic Social](https://tacticsocial.com).

[![npm version](https://img.shields.io/npm/v/@tactic-social/tas-feature-flags-react.svg)](https://www.npmjs.com/package/@tactic-social/tas-feature-flags-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Use This Library?

- **Type-Safe**: Full TypeScript support with generics for any value type
- **User-Specific Overrides**: Per-user flag overrides on top of global config
- **Flexible Values**: Support for booleans, strings, numbers, arrays, and nested objects
- **Nested Config**: Organize flags hierarchically, automatically flattened to dotted notation
- **Zero Dependencies**: Only requires React as a peer dependency
- **SSR/SSG Ready**: Works seamlessly with Next.js, Remix, Astro, and other frameworks
- **Declarative & Imperative**: Use hooks or components based on your preference
- **Tiny Bundle**: ~2KB gzipped
- **Tree-Shakeable**: Only import what you need

## Installation

```bash
npm install @tactic-social/tas-feature-flags-react
```

```bash
yarn add @tactic-social/tas-feature-flags-react
```

```bash
pnpm add @tactic-social/tas-feature-flags-react
```

## Quick Start

### 1. Wrap Your App with the Provider

```tsx
import { FeatureFlagProvider } from '@tactic-social/tas-feature-flags-react';

const config = {
  features: {
    auth: true,
    analytics: false,
  },
  platforms: ['facebook', 'instagram'],
  limits: {
    maxAccounts: 5,
  },
};

function App() {
  return (
    <FeatureFlagProvider config={config}>
      <YourApp />
    </FeatureFlagProvider>
  );
}
```

### 2. Use Flags in Your Components

#### Option A: Using Hooks (Imperative)

```tsx
import { useFeatureFlag, useFeatureEnabled } from '@tactic-social/tas-feature-flags-react';

function Dashboard() {
  // Get any value with type safety
  const platforms = useFeatureFlag<string[]>('platforms');
  const maxAccounts = useFeatureFlag<number>('limits.maxAccounts');

  // Check if a feature is enabled
  const hasAuth = useFeatureEnabled('features.auth');
  const hasFacebook = useFeatureEnabled('platforms', 'facebook');

  return (
    <div>
      {hasAuth && <LoginButton />}
      {platforms?.map(platform => <PlatformCard key={platform} name={platform} />)}
      <p>Max accounts: {maxAccounts}</p>
    </div>
  );
}
```

#### Option B: Using Component (Declarative)

```tsx
import { Flag } from '@tactic-social/tas-feature-flags-react';

function Dashboard() {
  return (
    <div>
      {/* Simple boolean check */}
      <Flag flag="features.auth">
        <LoginButton />
      </Flag>

      {/* Check if value exists in array */}
      <Flag flag="platforms" value="facebook">
        <FacebookWidget />
      </Flag>

      {/* Nested flags */}
      <Flag flag="features.analytics">
        <div>
          <h2>Analytics</h2>
          <Flag flag="platforms" value="instagram">
            <InstagramStats />
          </Flag>
        </div>
      </Flag>
    </div>
  );
}
```

## API Reference

### `<FeatureFlagProvider>`

The provider component that makes feature flags available to your app.

**Props:**
- `config`: `Record<string, any>` (required) - Your feature flag configuration (supports nested objects)
- `userOverrides`: `Record<string, Record<string, any>>` (optional) - Per-user flag overrides keyed by userId. User overrides take precedence over config for the specified user.
- `children`: `ReactNode` (required) - Your application components

**Example:**
```tsx
<FeatureFlagProvider
  config={{ features: { auth: true, beta: false } }}
  userOverrides={{
    user1: { features: { beta: true } },
    user2: { limits: { maxAccounts: 20 } },
  }}
>
  <App />
</FeatureFlagProvider>
```

---

### `useFeatureFlag<T>(key: string)`

Get a feature flag value with type safety.

**Parameters:**
- `key`: `string` - The feature flag key (supports dotted notation for nested values)

**Returns:** `T | undefined` - The flag value or undefined if not found

**Examples:**
```tsx
const isEnabled = useFeatureFlag<boolean>('features.auth');          // boolean
const platforms = useFeatureFlag<string[]>('platforms');             // string[]
const maxCount = useFeatureFlag<number>('limits.maxAccounts');       // number
const theme = useFeatureFlag<string>('theme');                       // string
```

---

### `useFeatureEnabled(key: string, value?: any)`

Check if a feature is enabled (boolean check).

**Parameters:**
- `key`: `string` - The feature flag key
- `value?`: `any` - Optional value to check in arrays

**Returns:** `boolean` - True if enabled, false otherwise

**Behavior:**
- For booleans: Returns the truthiness of the flag
- For arrays with `value` param: Returns true if value exists in array
- For other types with `value` param: Returns true if flag equals value
- Returns false if flag is undefined

**Examples:**
```tsx
const isAuthEnabled = useFeatureEnabled('features.auth');              // true/false
const hasFacebook = useFeatureEnabled('platforms', 'facebook');        // true if 'facebook' in array
const isDarkMode = useFeatureEnabled('theme', 'dark');                 // true if theme === 'dark'
```

---

### `useFeatureFlagForUser<T>(userId: string, key: string)`

Get a feature flag value for a specific user. Falls back to global config if no user override exists.

**Parameters:**
- `userId`: `string` - The user identifier
- `key`: `string` - The feature flag key (supports dotted notation)

**Returns:** `T | undefined` - The flag value or undefined if not found

**Examples:**
```tsx
const maxAccounts = useFeatureFlagForUser<number>('user1', 'limits.maxAccounts');
const platforms = useFeatureFlagForUser<string[]>('user1', 'platforms');
```

---

### `useFeatureEnabledForUser(userId: string, key: string, value?: any)`

Check if a feature is enabled for a specific user. Falls back to global config if no user override exists.

**Parameters:**
- `userId`: `string` - The user identifier
- `key`: `string` - The feature flag key
- `value?`: `any` - Optional value to check in arrays

**Returns:** `boolean` - True if enabled, false otherwise

**Examples:**
```tsx
const hasBeta = useFeatureEnabledForUser('user1', 'features.beta');
const hasFacebook = useFeatureEnabledForUser('user1', 'platforms', 'facebook');
```

---

### `<Flag>`

Declarative component for conditional rendering based on feature flags.

**Props:**
- `flag`: `string` (required) - The feature flag key
- `value?`: `any` (optional) - Value to check in arrays or match exactly
- `children`: `ReactNode` (required) - Content to render when enabled

**Examples:**
```tsx
{/* Render if flag is truthy */}
<Flag flag="features.auth">
  <LoginButton />
</Flag>

{/* Render if value exists in array */}
<Flag flag="platforms" value="facebook">
  <FacebookWidget />
</Flag>

{/* Render if exact match */}
<Flag flag="theme" value="dark">
  <DarkModeStyles />
</Flag>
```

---

### `useFeatureFlags()`

Access the full feature flags context (advanced usage).

**Returns:**
```typescript
{
  flags: Record<string, any>;
  getFeatureValue: <T>(key: string) => T | undefined;
  isFeatureEnabled: (key: string, value?: any) => boolean;
  getFeatureValueForUser: <T>(userId: string, key: string) => T | undefined;
  isFeatureEnabledForUser: (userId: string, key: string, value?: any) => boolean;
}
```

**Example:**
```tsx
const { flags, getFeatureValue, isFeatureEnabled } = useFeatureFlags();

// Access all flags
console.log(flags); // { 'features.auth': true, 'platforms': [...], ... }
```

---

### `flattenConfig(obj: Record<string, any>)`

Utility function to flatten nested objects into dotted notation (rarely needed directly).

**Example:**
```tsx
import { flattenConfig } from '@tactic-social/tas-feature-flags-react';

const nested = {
  features: { auth: true },
  platforms: ['facebook']
};

const flat = flattenConfig(nested);
// { 'features.auth': true, 'platforms': ['facebook'] }
```

## Advanced Usage

### Nested Configuration

Organize your flags hierarchically for better structure:

```tsx
const config = {
  features: {
    auth: {
      oauth: true,
      providers: ['google', 'github'],
    },
    analytics: false,
  },
  limits: {
    maxAccounts: 5,
    maxPosts: 100,
  },
};

// Access nested values with dotted notation
const oauth = useFeatureFlag<boolean>('features.auth.oauth');
const providers = useFeatureFlag<string[]>('features.auth.providers');
```

### User-Specific Overrides

Apply per-user flag overrides on top of global configuration:

```tsx
import {
  FeatureFlagProvider,
  useFeatureEnabledForUser,
  useFeatureFlagForUser,
} from '@tactic-social/tas-feature-flags-react';

const globalConfig = {
  features: {
    auth: true,
    beta: false,
  },
  limits: {
    maxAccounts: 5,
  },
};

const userOverrides = {
  user1: { features: { beta: true }, limits: { maxAccounts: 20 } },
  user2: { features: { beta: true } },
};

function App() {
  return (
    <FeatureFlagProvider config={globalConfig} userOverrides={userOverrides}>
      <Dashboard />
    </FeatureFlagProvider>
  );
}

function Dashboard() {
  const hasBeta = useFeatureEnabledForUser('user1', 'features.beta'); // true (overridden)
  const maxAccounts = useFeatureFlagForUser<number>('user1', 'limits.maxAccounts'); // 20 (overridden)
  const hasAuth = useFeatureEnabledForUser('user1', 'features.auth'); // true (from global)

  return (
    <div>
      {hasBeta && <BetaFeature />}
      <p>Max accounts: {maxAccounts}</p>
    </div>
  );
}
```

Override rules:
- User overrides take precedence over global config for the specified user
- If a user has no override for a key, the global config value is used
- If the userId is not found in userOverrides, all lookups fall back to global config
- Both `config` and `userOverrides` values support nested objects (both are flattened)

### Loading Config from API

```tsx
import { useState, useEffect } from 'react';
import { FeatureFlagProvider } from '@tactic-social/tas-feature-flags-react';

function App() {
  const [config, setConfig] = useState({});
  const [userOverrides, setUserOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/feature-flags').then(res => res.json()),
      fetch('/api/user-overrides').then(res => res.json()),
    ]).then(([globalFlags, overrides]) => {
      setConfig(globalFlags);
      setUserOverrides(overrides);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <FeatureFlagProvider config={config} userOverrides={userOverrides}>
      <Dashboard />
    </FeatureFlagProvider>
  );
}
```

### Next.js App Router (SSR)

```tsx
// app/layout.tsx
import { FeatureFlagProvider } from '@tactic-social/tas-feature-flags-react';
import config from './config/features.json';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FeatureFlagProvider config={config}>
          {children}
        </FeatureFlagProvider>
      </body>
    </html>
  );
}

// app/page.tsx (Server Component)
import { flattenConfig } from '@tactic-social/tas-feature-flags-react';
import config from './config/features.json';

export default function Page() {
  const flags = flattenConfig(config);
  const isEnabled = flags['features.auth'];

  return <div>{isEnabled ? 'Enabled' : 'Disabled'}</div>;
}

// components/ClientComponent.tsx (Client Component)
'use client';
import { useFeatureEnabled } from '@tactic-social/tas-feature-flags-react';

export default function ClientComponent() {
  const isEnabled = useFeatureEnabled('features.auth');
  return <div>{isEnabled ? 'Enabled' : 'Disabled'}</div>;
}
```

### TypeScript Type Safety

```tsx
// Define your config type
interface MyConfig {
  features: {
    auth: boolean;
    analytics: boolean;
  };
  platforms: string[];
  limits: {
    maxAccounts: number;
  };
}

// Use with type safety
const platforms = useFeatureFlag<string[]>('platforms');
const maxAccounts = useFeatureFlag<number>('limits.maxAccounts');
```

## Framework Compatibility

This library works with any React-based framework:

- ✅ **Next.js** (App Router & Pages Router)
- ✅ **Remix**
- ✅ **Astro**
- ✅ **Vite**
- ✅ **Create React App**
- ✅ **Gatsby**
- ✅ **TanStack Start**

## Best Practices

### 1. Choose the Right API

**Use hooks when:**
- You need the flag value for logic
- Multiple conditions based on flags
- Dynamic behavior based on flag values

**Use `<Flag>` component when:**
- Simple show/hide logic
- Declarative, readable JSX
- No need for flag value in logic

### 2. Organize Flags Hierarchically

```tsx
// Good - Organized structure
const config = {
  features: {
    auth: true,
    analytics: false,
  },
  limits: {
    maxAccounts: 5,
  },
};

// Avoid - Flat with unclear naming
const config = {
  feature_auth: true,
  feature_analytics: false,
  limit_max_accounts: 5,
};
```

### 3. Handle Undefined Flags

```tsx
// Good - Check for undefined
const platforms = useFeatureFlag<string[]>('platforms');
if (!platforms) return <EmptyState />;

// Bad - Will crash if undefined
const platforms = useFeatureFlag<string[]>('platforms');
return <div>{platforms.join(', ')}</div>;
```

### 4. Use Consistent Key Naming

```tsx
// Good - Dotted notation
'features.auth'
'features.analytics'
'limits.maxAccounts'

// Avoid - Inconsistent
'feature_auth'
'analytics-enabled'
```

## Migration from v0.x

If you're upgrading from version 0.x, here are the breaking changes:

### Provider Prop Change

```tsx
// Before (v0.x)
<FeatureFlagProvider initialFlags={{ feature1: true }}>

// After (v1.x)
<FeatureFlagProvider config={{ feature1: true }}>
```

### Hook Return Type Change

```tsx
// Before (v0.x)
const isEnabled = useFeatureFlag('feature1'); // Returns: boolean

// After (v1.x)
const value = useFeatureFlag('feature1'); // Returns: any
const isEnabled = useFeatureEnabled('feature1'); // Returns: boolean
```

### Removed Methods

```tsx
// Before (v0.x) - Had setFlag and setFlags
const { setFlag, setFlags } = useFeatureFlags();

// After (v1.x) - Read-only flags
const { flags, getFeatureValue, isFeatureEnabled } = useFeatureFlags();
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm test

# Type check
pnpm run type-check

# Lint
pnpm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Tactic Social](https://tacticsocial.com)

## Support

- 📧 Email: support@tacticsocial.com
- 🐛 Issues: [GitHub Issues](https://github.com/Tactic-Social/tas-feature-flags-react/issues)
- 📚 Documentation: [GitHub Repository](https://github.com/Tactic-Social/tas-feature-flags-react)

---

Made with ❤️ by [Tactic Social](https://tacticsocial.com)
