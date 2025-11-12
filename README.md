# Noverna Server Monorepo

Secure, transparent, and maintainable FiveM development for the long run.

This repository contains the server runtime and resources for the Noverna ecosystem. It follows the same principles as the organization: security-first, transparent by design, and built with modern tooling.

---

## What this repo is

A Bun + TypeScript monorepo that hosts FiveM resources and shared packages used by a FiveM server. It currently ships a minimal "core" resource (`resources/noverna-core`) with a clean TypeScript build pipeline and ready-to-extend structure.

- Security-first: no obfuscation, no backdoors, auditable source.
- Modern tooling: Bun workspaces, TypeScript, Biome for formatting/linting.
- Clear boundaries: client and server code compiled into separate outputs referenced by `fxmanifest.lua`.

We use Lua primarily for gameplay scripting where it fits best, and TypeScript for infrastructure-style modules (e.g., database, caching) where stronger typing and tooling provide clear benefits.

---

## Monorepo structure

```
server/data/
├─ package.json              # Bun workspaces & scripts
├─ bunfig.toml               # Bun configuration
├─ tsconfig.base.json        # Base TS config shared across packages/resources
├─ biome.json                # Biome formatter/linter config
├─ resources/
│  └─ noverna-core/          # Initial FiveM resource (TypeScript)
│     ├─ fxmanifest.lua      # FiveM resource manifest
│     ├─ package.json        # Resource-level scripts (build/typecheck)
│     ├─ tsconfig.json       # Resource-level TS config
│     ├─ src/
│     │  ├─ client/          # Client entrypoints (TS)
│     │  └─ server/          # Server entrypoints (TS)
│     └─ build/              # Compiled JS (client/server) consumed by FiveM
├─ packages/                 # Future shared libs (TS/Lua), optional
└─ tools/                    # Build helpers (optional utilities)
```

Workspace globs (`package.json`):

- `packages/*`
- `resources/**`

---

## Tech stack

- FiveM resource model via `fxmanifest.lua`
- Bun workspaces for dependency management and scripts
- TypeScript 5 with strict settings
- Biome for formatting/linting

---

## Getting started

### Prerequisites

- Git
- Bun (https://bun.sh) — latest stable recommended
- A local FiveM server artifact if you plan to run the resource in-game

### Install dependencies

```powershell
bun install
```

### Build everything (workspace)

```powershell
# Build all workspaces that define a "build" script
bun run build

# Or build all resources explicitly
bun run build:all

# Or just the core resource
bun run build:core
```

### Type-check (core resource)

```powershell
bun run --filter "@noverna/core" typecheck
```

### Format & lint (Biome)

```powershell
# Check for issues
bunx --bun biome check .

# Apply formatting
bunx --bun biome format .
```

---

## Running in FiveM

The `resources/noverna-core` resource compiles to CommonJS files consumed by FiveM.

1. Ensure this repository is placed where your FiveM server can read resources (commonly under your server's `resources/` directory). If your server expects a different location, you can symlink or copy `resources/noverna-core`.
2. Build the resource so `build/client/index.js` and `build/server/index.js` exist:
   ```powershell
   bun run build:core
   ```
3. Reference the resource in your `server.cfg`:
   ```
   ensure noverna-core
   ```
4. Start your server.

Notes:

- `fxmanifest.lua` points at `build/client/**/*.js` and `build/server/**/*.js`. Only compiled output is loaded by FiveM.
- Source TypeScript files live in `src/client` and `src/server`.

---

## Development workflow

- Write code in `src/client` or `src/server` within a resource.
- Run `bun run build:core` (or `bun run build`) to generate JS into `build/`.
- Keep PRs small and focused; all code must remain readable and auditable.
- Formatting and basic linting are enforced by Biome.

If you need a watch mode, consider adding file watching around Bun's `Bun.build` (not included by default to keep dependencies minimal).

---

## Security posture

- No secrets committed: `.env` files are ignored by `.gitignore`.
- No obfuscation or packers: code must remain auditable.
- Dependencies should be minimal and pinned by workspaces. Review changes carefully.
- Any contribution introducing remote code execution, telemetry without consent, or privilege escalation will be rejected.

---

## Contribution guidelines

- Use clear commit messages and meaningful PR descriptions.
- Keep to the repository layout and separation of client/server code.
- Follow Biome formatting; run `biome check` before opening a PR.
- Discuss bigger design changes in issues before implementing.

---

## Roadmap (high level)

- Expand `noverna-core` with stable, audited primitives (events, state, permissions).
- Add typed shared packages for database and caching (TypeScript).
- Introduce Lua modules for gameplay scripting where appropriate.
- Document module APIs and lifecycle hooks.

---

## License

See `LICENSE` in this repository. Organization-wide licensing details are available on the Noverna GitHub organization.

---

## Links

- Organization: https://github.com/project-noverna
- This repo: Noverna Server Monorepo
