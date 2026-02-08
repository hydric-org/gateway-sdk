import { GetSingleChainTokenListParams, GetSingleChainTokenListResult, SearchSingleChainTokensParams, SearchSingleChainTokensResult, SupportedChainId } from '../types.js';
import { fetchHydricApi } from '../utils/fetch-hydric-api.js';

/**
 * Resource class for interacting with single-chain token endpoints.
 *
 * @remarks
 * Use this resource for efficient single-chain token operations.
 * For cross-chain aggregated data, use {@link MultiChainTokensResource} instead.
 */
export class SingleChainTokensResource {
  constructor(
    /** @internal */
    private readonly baseUrl: string,
    /** @internal */
    private readonly getHeaders: () => HeadersInit,
  ) {}

  /**
   * Returns a paginated list of tokens available on a specific blockchain network.
   *
   * @param chainId - The numeric chain ID of the blockchain (e.g., 1 for Ethereum, 8453 for Base).
   * @param params - Optional configuration and filters for the token list.
   * @returns A promise that resolves to the single-chain token list response.
   * @throws {HydricInvalidParamsError} If the chainId is unsupported or validation fails (400).
   *
   * @example
   * ```typescript
   * const { tokens, nextCursor } = await hydric.singleChainTokens.list(8453, {
   *   config: {
   *     limit: 10,
   *     orderBy: { field: 'tvl', direction: 'desc' }
   *   },
   *   filters: {
   *     minimumTotalValuePooledUsd: 50000
   *   }
   * });
   * ```
   */
  public async list(chainId: SupportedChainId, params: GetSingleChainTokenListParams = {}): Promise<GetSingleChainTokenListResult> {
    return fetchHydricApi<GetSingleChainTokenListResult>(`${this.baseUrl}/v1/tokens/${chainId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }

  /**
   * Searches for tokens on a specific blockchain network by keyword (name or symbol).
   *
   * @param chainId - The numeric chain ID of the blockchain (e.g., 1 for Ethereum, 8453 for Base).
   * @param params - Search parameters including the keyword and optional config/filters.
   * @param params.search - The search term to filter assets by ticker symbol or name (case-insensitive).
   * @param params.config - Optional configuration for results (limit, ordering, cursor).
   * @param params.filters - Optional filters to narrow results (minimumTotalValuePooledUsd, etc).
   * @returns A promise that resolves to the search results containing matched tokens.
   * @throws {HydricInvalidParamsError} If the search term is empty or validation fails (400).
   *
   * @example
   * ```typescript
   * const { tokens, nextCursor } = await hydric.singleChainTokens.search(8453, {
   *   search: 'USDC',
   *   config: { limit: 10 },
   *   filters: { minimumTotalValuePooledUsd: 10000 }
   * });
   *
   * ```
   */
  public async search(chainId: SupportedChainId, params: SearchSingleChainTokensParams): Promise<SearchSingleChainTokensResult> {
    return fetchHydricApi<SearchSingleChainTokensResult>(`${this.baseUrl}/v1/tokens/${chainId}/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }
}
