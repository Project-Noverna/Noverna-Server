# Contributing to Noverna Server

Thanks for your interest in contributing! We value security, transparency, and maintainability above all.

## Code of Conduct

By participating, you agree to uphold our standards of respectful, constructive collaboration. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Development setup

1. Install prerequisites: Git, Bun, TypeScript
2. Install deps: `bun install`
3. Build: `bun run build` (or `bun run build:core`)
4. Typecheck: `bun run --filter "@noverna/core" typecheck`
5. Format & lint: `bunx --bun biome check .`

## Pull requests

- Create a feature branch from `main`
- Keep PRs small and focused; one logical change per PR
- Ensure:
  - Build succeeds
  - Typecheck passes
  - Biome formatting applied
- Fill out the PR template completely
- Link related issues ("Closes #123")

## Commit messages

- Use imperative present: "Add", "Fix", "Refactor"
- Keep concise but informative
- Reference issues where appropriate

## Testing

- Prefer small, fast checks (typecheck, build)
- Add tests when logic grows (unit/integration) — structure TBD as project evolves

## Security

- Do not include secrets in code or history
- Avoid dependencies that obfuscate or pack code
- Report vulnerabilities privately (see SECURITY.md)

## Licensing

- Contributions are under the repository's MIT license unless stated otherwise

## Questions

Open an issue with the "Question" template or start a discussion in the org.
