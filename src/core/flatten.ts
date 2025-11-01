export function flattenConfig(obj: Record<string, any>): Record<string, any> {
  try {
    JSON.stringify(obj);
  } catch (e) {
    throw new Error(
      'Config contains circular references. Feature flags must be JSON-serializable.'
    );
  }

  return flatten(obj);
}

function flatten(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      continue;
    }

    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = value;
      continue;
    }

    if (Array.isArray(value)) {
      result[newKey] = value;
      continue;
    }

    if (typeof value === 'object' && value.constructor === Object) {
      const nested = flatten(value, newKey);
      Object.assign(result, nested);
      continue;
    }

    result[newKey] = value;
  }

  return result;
}
