# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

Reflect is a CLI tool that fetches GitHub activity (merged PRs, closed issues, PR reviews) and uses LLM APIs to generate brag documents for performance reviews.

## Development Commands

```bash
./script/setup              # First-time setup (installs deps, checks .env)
./script/test               # Run all tests
./script/test --watch       # Run tests in watch mode
./script/test <path>        # Run single test: ./script/test __tests__/unit/cli.test.ts
npm run typecheck           # TypeScript type checking
./reflect --username <user> --lookback <months> --brag  # Run the tool
```

## Architecture

**Entry flow:** `index.ts` → `lib/core/cli.ts` (Commander parsing) → `lib/core/reflect.ts` (orchestration)

**Key modules:**
- `lib/integrations/github/` - Octokit GraphQL client for fetching PRs, issues, reviews
- `lib/integrations/llm/` - Provider abstraction (OpenAI, Anthropic) with `callLlm()` dispatcher
- `lib/generators/` - Markdown document generators (contributions, summaries, brag docs)
- `lib/prompts/` - LLM prompt templates stored as markdown files
- `lib/utils/` - Date calculations, file I/O, debug logging

**Data types:** `GitHubPr`, `GitHubIssue`, `GitHubReview` defined in `lib/core/types.ts`

## Testing

Tests use Vitest with fast-check for property-based testing. Tests live in `__tests__/unit/` and follow the pattern `*.test.ts`.

## Environment Variables

Required: `GITHUB_TOKEN`
For LLM features: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
Debug mode: `DEBUG=1`

## TypeScript

- ES modules with `.js` extension in imports (NodeNext resolution)
- Strict mode enabled
- Target ES2022
