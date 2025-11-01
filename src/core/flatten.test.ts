import { describe, it, expect } from 'vitest';
import { flattenConfig } from './flatten';

describe('flattenConfig', () => {
  it('flattens nested objects with dotted notation', () => {
    const nested = {
      features: {
        auth: true,
        analytics: false,
      },
      platforms: ['facebook', 'instagram'],
    };

    const result = flattenConfig(nested);

    expect(result).toEqual({
      'features.auth': true,
      'features.analytics': false,
      platforms: ['facebook', 'instagram'],
    });
  });

  it('flattens deeply nested objects', () => {
    const nested = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
          },
        },
      },
    };

    const result = flattenConfig(nested);

    expect(result).toEqual({
      'level1.level2.level3.value': 'deep',
    });
  });

  it('preserves arrays as values', () => {
    const config = {
      platforms: ['facebook', 'instagram', 'twitter'],
      settings: {
        enabled: [1, 2, 3],
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      platforms: ['facebook', 'instagram', 'twitter'],
      'settings.enabled': [1, 2, 3],
    });
  });

  it('handles null and undefined values', () => {
    const config = {
      nullable: null,
      undefinedValue: undefined,
      nested: {
        alsoNull: null,
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      nullable: null,
      undefinedValue: undefined,
      'nested.alsoNull': null,
    });
  });

  it('handles primitive values', () => {
    const config = {
      string: 'value',
      number: 42,
      boolean: true,
      nested: {
        float: 3.14,
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      string: 'value',
      number: 42,
      boolean: true,
      'nested.float': 3.14,
    });
  });

  it('handles empty objects', () => {
    const result = flattenConfig({});
    expect(result).toEqual({});
  });

  it('handles mixed nested structures', () => {
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
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      'features.auth.oauth': true,
      'features.auth.providers': ['google', 'github'],
      'features.analytics': false,
      'limits.maxAccounts': 5,
    });
  });

  it('throws error for circular references', () => {
    const circular: any = { a: 1 };
    circular.self = circular;

    expect(() => flattenConfig(circular)).toThrow(
      'Config contains circular references'
    );
  });

  it('handles objects with prototype properties correctly', () => {
    const obj = Object.create({ inherited: 'value' });
    obj.own = 'ownValue';

    const result = flattenConfig(obj);

    expect(result).toEqual({
      own: 'ownValue',
    });
    expect(result).not.toHaveProperty('inherited');
  });

  it('preserves Date objects as values', () => {
    const date = new Date('2025-01-01');
    const config = {
      timestamp: date,
      nested: {
        createdAt: date,
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      timestamp: date,
      'nested.createdAt': date,
    });
  });

  it('handles objects with special keys', () => {
    const config = {
      'key-with-dash': 'value1',
      'key.with.dots': 'value2',
      nested: {
        'special-key': 'value3',
      },
    };

    const result = flattenConfig(config);

    expect(result).toEqual({
      'key-with-dash': 'value1',
      'key.with.dots': 'value2',
      'nested.special-key': 'value3',
    });
  });
});
