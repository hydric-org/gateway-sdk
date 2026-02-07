---
trigger: always_on
---

# hydric Gateway SDK Standards

## 1. Responsibility

The SDK is a lightweight wrapper for the hydric gateway layer (https://docs.hydric.org). It handles network requests, authentication headers, and response parsing so the user doesn't have to.

## 2. DX (Developer Experience) - The "Junior Test"

DX is the primary metric. To pass the "Junior Test," the SDK must:

- **Zero Config Start:** Provide a single `Hydric` client class.
- **IntelliSense Driven:** Every API response must have a corresponding TypeScript Interface. A developer should never have to check the docs to know what fields a "Basket" has; they should see it in their IDE.
- **Fail Fast & Loud:** If an API Key is missing or a parameter is invalid, throw a named error (e.g., `HydricValidationError`) with a message that explains _exactly_ how to fix it.

## 3. Technical Implementation

- **Dependencies:** Zero or minimal dependencies. Use native `fetch` where possible.
- **Architecture:** Use a Resource-based pattern (e.g., `hydric.baskets.get()`, `hydric.tokens.search()`).
- **Authentication:** API keys must be set once during initialization. Do not require them in individual method calls.
- **Async/Await:** All network-touching methods must be asynchronous and return Promises.

## 4. Single Source of Truth

The SDK must stay in sync with the Gateway API. Always reference:

- Spec: https://api.hydric.org/v1/openapi.json
- Docs: https://hydric.mintlify.app/api-reference
