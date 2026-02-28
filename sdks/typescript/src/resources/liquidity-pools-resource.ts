import { SearchPoolsParams, SearchPoolsResult } from '../types.js';
import { fetchHydricApi } from '../utils/fetch-hydric-api.js';

/**
 * Resource class for interacting with liquidity pool endpoints.
 *
 * @remarks
 * Use this resource to search and discover DeFi liquidity pools across multiple chains and protocols.
 */
export class LiquidityPoolsResource {
  constructor(
    /** @internal */
    private readonly baseUrl: string,
    /** @internal */
    private readonly getHeaders: () => HeadersInit,
  ) {}

  /**
   * Searches for liquidity pools across multiple chains and protocols.
   *
   * @param params - Search criteria including tokens, baskets, filters, pagination config, etc.
   * @param params.tokensA - Primary set of token addresses. Returns pools containing at least one of these tokens.
   * @param params.basketsA - Primary set of token baskets. The gateway will resolve these into tokens A.
   * @param params.tokensB - Secondary set of token addresses to narrow the search to specific pairs.
   * @param params.basketsB - Secondary set of token baskets to narrow the search to specific pairs.
   * @param params.filters - Filters based on pool attributes like TVL, protocol, and pool type.
   * @param params.config - Configuration for limit, cursor-based pagination, ordering, native token handling, etc.
   * @returns A promise that resolves to the search results containing matched liquidity pools, applied filters, and a pagination cursor.
   * @throws {HydricInvalidParamsError} If request validation fails (400), such as invalid addresses or protocol IDs.
   *
   * @example
   * ```typescript
   * // Search pools containing USDC on Ethereum, ordered by yield
   * const { pools, nextCursor } = await hydric.pools.search({
   *   tokensA: [
   *     { chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }
   *   ],
   *   config: {
   *     limit: 10,
   *     orderBy: { field: 'yield', direction: 'desc', timeframe: '24h' }
   *   },
   *   filters: {
   *     minimumTotalValueLockedUsd: 50000
   *   }
   * });
   *
   * // Search pools using baskets (server-side resolution)
   * const { pools } = await hydric.pools.search({
   *   basketsA: [{ basketId: 'usd-stablecoins', chainIds: [1, 8453] }],
   *   tokensB: [
   *     { chainId: 1, address: '0x0000000000000000000000000000000000000000' }
   *   ]
   * });
   * ```
   */
  public async search(params: SearchPoolsParams): Promise<SearchPoolsResult> {
    return fetchHydricApi<SearchPoolsResult>(`${this.baseUrl}/v1/pools/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }
}
