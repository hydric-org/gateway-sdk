import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HydricInvalidParamsError, HydricRateLimitError } from '../index.js';
import { LiquidityPoolsResource } from './liquidity-pools-resource.js';

describe('PoolsResource', () => {
  const baseUrl = 'https://api.hydric.org';
  const mockHeaders = {
    Authorization: 'Bearer sk_test_123',
    'Content-Type': 'application/json',
  };
  const getHeaders = vi.fn().mockReturnValue(mockHeaders);
  let pools: LiquidityPoolsResource;

  beforeEach(() => {
    pools = new LiquidityPoolsResource(baseUrl, getHeaders);
    vi.stubGlobal('fetch', vi.fn());
    getHeaders.mockClear();
  });

  describe('search', () => {
    it('should POST to /v1/pools/search with request body', async () => {
      const mockData = {
        pools: [
          {
            address: '0x8ad599c3a01ae48104127aeeb893430d0bc41221',
            tokens: [
              {
                chainId: 1,
                address: '0x0000000000000000000000000000000000000000',
                decimals: 18,
                name: 'Ether',
                symbol: 'ETH',
                logoUrl: 'https://logos.hydric.org/tokens/1/0x0000000000000000000000000000000000000000',
              },
              {
                chainId: 1,
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                decimals: 6,
                name: 'USD Coin',
                symbol: 'USDC',
                logoUrl: 'https://logos.hydric.org/tokens/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              },
            ],
            balance: {
              totalValueLockedUsd: 3001.32,
              tokens: [],
            },
            chainId: 1,
            createdAtTimestamp: 1768429616,
            feeTier: { feeTierPercentage: 0.3, isDynamic: false },
            type: 'V3',
            stats: {
              stats24h: { feesUsd: 12450.55, swapVolumeUsd: 4124500.22, yield: 12.5, netInflowUsd: 450000, liquidityVolumeUsd: 120000 },
              stats7d: { feesUsd: 85400.12, swapVolumeUsd: 28450100.45, yield: 11.2, netInflowUsd: 1200000, liquidityVolumeUsd: 850000 },
              stats30d: { feesUsd: 345200.55, swapVolumeUsd: 115045000.11, yield: 10.8, netInflowUsd: 5400000, liquidityVolumeUsd: 3200000 },
              stats90d: { feesUsd: 1120400.88, swapVolumeUsd: 375200400.55, yield: 10.5, netInflowUsd: 12500000, liquidityVolumeUsd: 9800000 },
            },
            protocol: {
              id: 'uniswap-v3',
              logoUrl: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
              name: 'Uniswap V3',
              url: 'https://app.uniswap.org',
            },
            metadata: {
              latestSqrtPriceX96: '1564073352721610496185854744476',
              tickSpacing: 60,
              latestTick: '201235',
              positionManagerAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
            },
          },
        ],
        filters: {},
        nextCursor: null,
      };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/pools/search',
        traceId: 'req_123',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const searchParams = {
        tokensA: [{ chainId: 1 as const, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
      };

      const result = await pools.search(searchParams);

      expect(result).toEqual(mockData);
      expect(getHeaders).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/pools/search`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(searchParams),
        }),
      );
    });

    it('should pass filters and config to the API', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { pools: [], filters: {} } }),
      } as Response);

      const searchParams = {
        tokensA: [{ chainId: 1 as const, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
        config: {
          limit: 10,
          orderBy: { field: 'yield' as const, direction: 'desc' as const, timeframe: '24h' as const },
        },
        filters: {
          minimumTotalValueLockedUsd: 50000,
          protocols: ['uniswap-v3', 'uniswap-v4'],
        },
      };

      await pools.search(searchParams);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(searchParams),
        }),
      );
    });

    it('should throw HydricInvalidParamsError on 400 validation error', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/pools/search',
        traceId: 'req_789',
        error: {
          code: 'VALIDATION_ERROR',
          title: 'Invalid Parameters',
          message: 'Invalid query parameters.',
          details: "Check the 'meta' field for specific field-level violations.",
          metadata: {
            property: 'minTvl',
            value: 'invalid',
            constraints: { isNumber: ['minTvl must be a number'] },
          },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      try {
        await pools.search({
          tokensA: [{ chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
        });
        expect.fail('Should have thrown HydricInvalidParamsError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        expect((error as HydricInvalidParamsError).name).toBe('HydricInvalidParamsError');
      }
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/pools/search',
        traceId: 'req_xyz',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Rate limit exceeded',
          metadata: { retryAfterSeconds: 30 },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await pools.search({
          tokensA: [{ chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
        });
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(30);
      }
    });
  });
});
