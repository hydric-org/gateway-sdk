# hydric Gateway SDK family

> **The Universal DeFi Normalized Data Layer.**
> High-fidelity, multi-protocol, multi-chain data SDKs designed for builders who demand performance and type-safety.

---

## 🌊 Overview

The **hydric Gateway SDK** is the primary entry point for developers interacting with the [hydric gateway](https://docs.hydric.org). It provides a sleek, normalized interface to complex cross-chain DeFi data, abstracting away the nuances of individual protocols and network differences.

### Core Principles

- 🚀 **Zero Config Start:** One client, immediate data access.
- 💎 **Nominal Integrity:** Uses **Branded Types** and **Enums** to prevent logical contamination.
- ⚡ **IntelliSense Driven:** Automated type generation from the live OpenAPI specification.
- 🛡️ **Fail Fast & Loud:** Descriptive, named errors (`HydricError`) for faster debugging.

---

## 📁 Repository Structure

```tree
hydric/
├── .github/              # Unified CI/CD & Auto-Release workflows
├── .changeset/           # Versioning and release metadata
├── docs/                 # Documentation assets and source
├── specs/                # OpenAPI 1.0.0 (The source of truth)
└── sdks/                 # The family of SDKs
    ├── typescript/       # @hydric/gateway (Primary SDK)
    ├── python/           # [Upcoming]
    └── go/               # [Upcoming]
```

---

## ⚒️ Development Tools

This monorepo utilizes a modern, performance-oriented tech stack:

- **Package Management:** [pnpm](https://pnpm.io/) for efficient workspace handling.
- **Bundling:** [tsup](https://tsup.egoist.dev/) for fast, ebuild-powered distribution.
- **Testing:** [Vitest](https://vitest.dev/) for blazing-fast unit and integration testing.
- **Linting:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) with strict nominal typing rules.
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) to ensure local quality checks before push.
- **Versioning:** [@changesets/cli](https://github.com/changesets/changesets) for clean, automated delivery.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/installation) >= 9.0

### Setup

```bash
# Clone the repository
git clone https://github.com/hydric-org/gateway-sdk.git
cd gateway-sdk

# Install dependencies and setup husky
pnpm install
```

### Common Commands

```bash
# Build all SDKs
pnpm build

# Build specific SDK (e.g. TypeScript)
pnpm build:typescript

# Run testing suite
pnpm test
pnpm test:typescript

# Run linting
pnpm lint
pnpm lint:typescript
```

---

## 🔄 Changeset Workflow

We use **Changesets** to handle versioning and changelogs. **Every** PR that modifies code in `sdks/` must include a changeset.

1. **Add a changeset:**
   ```bash
   pnpm changeset
   ```
2. **Select the package** (e.g., `@hydric/gateway`).
3. **Select the version bump** (patch, minor, major).
4. **Write a concise summary** of your changes.
5. **Commit** the generated `.changeset/*.md` file with your PR.

_Merging to `main` will automatically trigger a "Version Packages" PR. Once that is merged, the SDK is published to NPM with provenance._

---

## 💡 Tips & Scripts

### 🛰️ The `sync` Command

If the Gateway API changes, you don't need to manually update types. Run:

```bash
# Sync all SDKs
pnpm sync

# Sync only TypeScript
pnpm sync:typescript
```

This command downloads the latest `openapi.json` from the production gateway and regenerates the standard types/interfaces, ensuring the SDK and Backend are perfectly aligned.

Since this is a monorepo, you can target specific SDKs easily using the new command aliases or the `--filter` flag:

```bash
# Only test the TS SDK (using alias)
pnpm test:typescript

# Equivalent using filter
pnpm --filter @hydric/gateway test
```

### 📋 Coding Standards

We follow high engineering standards. Contributed code **must** adhere to:

- **Semantic Naming:** Files must use `kebab-case` with functional suffixes (e.g., `-service.ts`).
- **Nominal Typing:** Raw strings/numbers for statuses are prohibited—use the provided Enums.
- **Named Parameters:** Any function with 3+ arguments **must** use object destructuring for call-site clarity.

---

## 📜 License

Licensed under the **Apache License, Version 2.0**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ by the <b>hydric</b> team.
</p>
