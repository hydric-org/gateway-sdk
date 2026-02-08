import { GetMultiChainTokenListParams, GetMultiChainTokenListResult, SearchMultichainTokensParams, SearchMultichainTokensResult } from '../types.js';
import { fetchHydricApi } from '../utils/fetch-hydric-api.js';

/**
 * Resource class for interacting with multi-chain token endpoints.
 *
 * @remarks
 * Use this resource for aggregated token data across multiple blockchains.
 * For single-chain operations, use {@link SingleChainTokensResource}.
 */
export class MultiChainTokensResource {
  constructor(
    /** @internal */
    private readonly baseUrl: string,
    /** @internal */
    private readonly getHeaders: () => HeadersInit,
  ) {}

  /**
   * Returns a list of tokens containing metadata for multiple blockchains in one single model.
   *
   * @param params - Configuration and filters for the token list.
   * @returns A promise that resolves to the multi-chain token list response.
   * @throws {HydricApiError} If the API returns an error response.
   * @throws {HydricNotFoundError} If the requested resource is not found (404).
   *
   * @example
   * ```typescript
   * const { tokens, nextCursor } = await hydric.multichainTokens.list({
   *   config: {
   *     limit: 10,
   *     orderBy: { field: 'tvl', direction: 'desc' }
   *   },
   *   filters: {
   *     chainIds: [1, 8453]
   *   }
   * });
   * ```
   */
  public async list(params: GetMultiChainTokenListParams = {}): Promise<GetMultiChainTokenListResult> {
    return fetchHydricApi<GetMultiChainTokenListResult>(`${this.baseUrl}/v1/tokens`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }

  /**
   * Searches for multi-chain assets across all multiple blockchains by keyword (name or symbol).
   *
   * @param params - Search parameters including the keyword and optional config/filters.
   * @param params.search - The search term to filter assets by ticker symbol or name (case-insensitive).
   * @param params.config - Optional configuration for results (limit, ordering, cursor).
   * @param params.filters - Optional filters to narrow results (chainIds, minimumTotalValuePooledUsd, etc).
   * @returns A promise that resolves to the search results containing matched tokens.
   * @throws {HydricInvalidParamsError} If the search term is empty or validation fails (400).
   *
   * @example
   * ```typescript
   * const { tokens, nextCursor } = await hydric.multichainTokens.search({
   *   search: 'USDC',
   *   config: { limit: 10 },
   *   filters: { chainIds: [1, 8453] }
   * });
   *
   * for (const token of tokens) {
   *   console.log(`${token.symbol}: Available on chains ${token.chainIds.join(', ')}`);
   * }
   * ```
   */
  public async search(params: SearchMultichainTokensParams): Promise<SearchMultichainTokensResult> {
    return fetchHydricApi<SearchMultichainTokensResult>(`${this.baseUrl}/v1/tokens/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }
}
