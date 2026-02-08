import { describe, expect, it } from 'vitest';
import { buildQueryString } from './build-query-string.js';

describe('buildQueryString', () => {
  it('should return empty string for empty object', () => {
    const result = buildQueryString({});
    expect(result).toBe('');
  });

  it('should build query string with single parameter', () => {
    const result = buildQueryString({ search: 'USDC' });
    expect(result).toBe('?search=USDC');
  });

  it('should build query string with multiple parameters', () => {
    const result = buildQueryString({ search: 'USDC', limit: 10 });
    expect(result).toBe('?search=USDC&limit=10');
  });

  it('should handle array parameters by appending multiple values', () => {
    const result = buildQueryString({ chainIds: [1, 8453, 130] });
    expect(result).toBe('?chainIds=1&chainIds=8453&chainIds=130');
  });

  it('should handle mixed scalar and array parameters', () => {
    const result = buildQueryString({
      chainIds: [1, 8453],
      basketIds: ['usd-stablecoins', 'eth-pegged-tokens'],
      limit: 10,
    });
    expect(result).toBe(
      '?chainIds=1&chainIds=8453&basketIds=usd-stablecoins&basketIds=eth-pegged-tokens&limit=10',
    );
  });

  it('should skip undefined values', () => {
    const result = buildQueryString({ search: 'USDC', limit: undefined });
    expect(result).toBe('?search=USDC');
  });

  it('should skip null values', () => {
    const result = buildQueryString({ search: 'USDC', limit: null });
    expect(result).toBe('?search=USDC');
  });

  it('should skip empty arrays', () => {
    const result = buildQueryString({ chainIds: [], search: 'USDC' });
    expect(result).toBe('?search=USDC');
  });

  it('should handle boolean values', () => {
    const result = buildQueryString({ includeMetadata: true, skipCache: false });
    expect(result).toBe('?includeMetadata=true&skipCache=false');
  });

  it('should handle numeric values', () => {
    const result = buildQueryString({ limit: 10, offset: 0 });
    expect(result).toBe('?limit=10&offset=0');
  });

  it('should handle all undefined/null/empty values', () => {
    const result = buildQueryString({ a: undefined, b: null, c: [] });
    expect(result).toBe('');
  });

  it('should URL-encode special characters', () => {
    const result = buildQueryString({ search: 'hello world' });
    expect(result).toBe('?search=hello+world');
  });
});
