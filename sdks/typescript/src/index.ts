import { HydricInvalidParamsError } from './errors/hydric-invalid-params.error.js';
import type { components, operations, paths } from './generated/api-types.js';
import { MultiChainTokensResource } from './resources/multi-chain-tokens-resource.js';
import { SingleChainTokensResource } from './resources/single-chain-tokens-resource.js';
import { TokenBasketsResource } from './resources/token-baskets-resource.js';

const BASE_API_URL = process.env.BASE_API_URL!;
const DASHBOARD_URL = process.env.DASHBOARD_URL!;

/**
 * Configuration options for the hydric Gateway SDK initialization.
 */
export interface hydricGatewayApiOptions {
  /**
   * The secret API key required to authenticate with the hydric Gateway.
   * You can retrieve this from the hydric Dashboard.
   * @see https://dashboard.hydric.org
   */
  apiKey: string;
  /**
   * The base URL for the hydric Gateway API.
   * Defaults to the production API URL.
   */
  baseUrl?: string;
}

/**
 * The main entry point for the hydric Gateway SDK.
 * Handles authentication and provides access to hydric data resources.
 *
 * @example
 * ```typescript
 * import { HydricGateway } from '@hydric/gateway';
 *
 * const hydric = new HydricGateway({
 *   apiKey: 'your_api_key_here'
 * });
 * ```
 */
export class HydricGateway {
  /** @internal */
  private readonly apiKey: string;
  /** @internal */
  private readonly baseUrl: string;

  /**
   * Access the MultiChainTokens resource.
   * Use this to fetch multi-chain token lists, search tokens, and aggregate data.
   *
   * @remarks
   * ⚠️ **Performance Note:** Only use this resource if you specifically need data across multiple chains.
   * For single-chain operations, use {@link SingleChainTokensResource} instead as it is significantly more efficient.
   *
   * @see {@link MultiChainTokensResource}
   */
  public readonly multichainTokens: MultiChainTokensResource;

  /**
   * Access the SingleChainTokens resource.
   * Use this for efficient single-chain token operations like listing, searching, and getting token details.
   *
   * @remarks
   * This is the preferred resource for single-chain operations as it is more efficient
   * than the multi-chain equivalent.
   *
   * @see {@link SingleChainTokensResource}
   */
  public readonly singleChainTokens: SingleChainTokensResource;

  /**
   * Access the TokenBaskets resource.
   * Use this to retrieve curated groups of related tokens (e.g., stablecoins, BTC pegged tokens, etc.).
   *
   * @see {@link TokenBasketsResource}
   */
  public readonly tokenBaskets: TokenBasketsResource;

  /**
   * Creates a new instance of the hydric Gateway SDK client.
   * This initialization is synchronous and does not perform any network requests.
   * Validation of the API key occurs locally during instantiation and on the server
   * during subsequent API calls.
   *
   * @param options - Configuration options for the client.
   * @throws {HydricInvalidParamsError} If the API key is missing or invalidly formatted.
   *
   * @example
   * ```typescript
   * const hydric = new HydricGateway({ apiKey: '...' });
   * ```
   */
  constructor(options: hydricGatewayApiOptions) {
    if (!options.apiKey) {
      throw new HydricInvalidParamsError(`HydricGateway: API key is required. Get one at ${DASHBOARD_URL}`);
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || this.getBaseUrl();
    this.multichainTokens = new MultiChainTokensResource(this.baseUrl, this.getHeaders.bind(this));
    this.singleChainTokens = new SingleChainTokensResource(this.baseUrl, this.getHeaders.bind(this));
    this.tokenBaskets = new TokenBasketsResource(this.baseUrl, this.getHeaders.bind(this));
  }

  /**
   * Returns the common headers required for hydric Gateway API requests.
   *
   * @returns An object containing the Authorization and Content-Type headers.
   * @protected
   */
  protected getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Returns the base URL for the hydric Gateway API.
   *
   * @returns The hardcoded base URL of the API.
   * @protected
   */
  protected getBaseUrl(): string {
    return BASE_API_URL;
  }
}

export * from './errors/hydric-error.js';
export * from './errors/hydric-not-found.error.js';
export * from './errors/hydric-rate-limit.error.js';

export * from './errors/hydric-invalid-params.error.js';
export * from './errors/hydric-unauthorized.error.js';

export * from './resources/multi-chain-tokens-resource.js';
export * from './resources/single-chain-tokens-resource.js';
export * from './resources/token-baskets-resource.js';

export * from './types.js';

export type { components, operations, paths };
