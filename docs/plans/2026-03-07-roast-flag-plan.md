# Plan: Add --roast CLI Flag (2026-03-07)

## Summary

Add a `--roast` CLI flag that generates a humorous roast document of the
user's GitHub contributions. This is the comedic counterpart to `--brag` —
instead of highlighting achievements, it playfully roasts the user for
trivial PRs, over-engineering, yak-shaving, and other common developer
foibles. The implementation follows the exact same 5-layer pattern used by
`--brag` and `--star`.

## Stakes Classification

**Level**: Low
**Rationale**: Isolated additive feature that follows an established pattern
exactly. No existing behavior is modified. Easy to roll back by reverting
the commit. All changes are well-scoped to new files plus small additions
to existing files.

## Context

**Research**: Conducted in-session (no separate research document)
**Affected Areas**: CLI parsing, orchestration, generators, prompts, tests

## Success Criteria

- [ ] `--roast` flag is accepted by the CLI and documented in help text
- [ ] Running with `--roast` generates `output/roast_document.md`
- [ ] The roast document is humorous and based on the user's actual
      contributions
- [ ] The feature follows the same summarize-then-generate pipeline as
      `--brag` and `--star`
- [ ] All existing tests pass
- [ ] New unit tests cover CLI parsing of the `--roast` flag
- [ ] TypeScript typechecks pass

## Implementation Steps

### Phase 1: CLI and Types

#### Step 1.1: Test CLI parsing of --roast flag (RED)

- **Files**: `__tests__/unit/cli.test.ts`
- **Action**: Add failing tests for `--roast` flag parsing
- **Test cases**:
  - `--roast` present → `generateRoast: true`
  - `--roast` absent → `generateRoast: false`
  - `--roast` combined with `--brag` → both true (they are independent)
- **Verify**: Tests exist and fail (no implementation yet)
- **Complexity**: Small

#### Step 1.2: Add --roast to CLI and CliArgs (GREEN)

- **Files**: `lib/core/cli.ts:29-43` (CliArgs interface),
  `lib/core/cli.ts:240` (option), `lib/core/cli.ts:295` (return)
- **Action**:
  - Add `generateRoast: boolean` to `CliArgs` interface
  - Add `.option('--roast', 'Generate a roast document')` after `--star`
  - Add `generateRoast: options.roast || false` to return object
  - Add example in help text
- **Verify**: Tests from Step 1.1 pass; `npm run typecheck` passes
- **Complexity**: Small

### Phase 2: Prompt and Generator

#### Step 2.1: Create roast system prompt

- **Files**: `lib/prompts/system/roast-document.md` (new)
- **Action**: Write a system prompt that instructs the LLM to generate a
  humorous roast of contributions. Tone: playful, witty, self-deprecating
  humor. Structure: themed sections (e.g., "Most Underwhelming PRs",
  "Award for Most Over-Engineered Solution", "Yak Shave Hall of Fame").
  Follow the same markdown template pattern as `brag-document.md`.
- **Verify**: File exists with coherent prompt content
- **Complexity**: Small

#### Step 2.2: Create roast generator

- **Files**: `lib/generators/roast-generator.ts` (new)
- **Action**: Create `generateRoastDocument()` following the exact pattern
  of `brag-generator.ts`:
  - Import `callLlm`, `formatDateForDisplay`, `readPrompt`, `LlmOptions`
  - Read prompt via `readPrompt('roast-document')`
  - Format content with time period
  - Call and return `callLlm()`
- **Verify**: File exists; `npm run typecheck` passes
- **Complexity**: Small

### Phase 3: Document Utils and Orchestration

#### Step 3.1: Add roast handlers to document-utils

- **Files**: `lib/generators/document-utils.ts`
- **Action**: Add two functions following `--star` pattern:
  - `generateAndWriteRoast()` — generates roast doc, writes to
    `roast_document.md` with spinner
  - `handleRoastGeneration()` — calls `generateAndWriteSummary()` then
    `generateAndWriteRoast()`
  - Import `generateRoastDocument` from roast generator
- **Verify**: `npm run typecheck` passes
- **Complexity**: Small

#### Step 3.2: Wire --roast into orchestration

- **Files**: `lib/core/reflect.ts:16-31` (destructure),
  `lib/core/reflect.ts:86-100` (generation block)
- **Action**:
  - Destructure `generateRoast` from args
  - Add `if (generateRoast)` block after `generateStar`, following same
    pattern: get API key, throw if missing, call
    `handleRoastGeneration()`
  - Import `handleRoastGeneration` from document-utils
- **Verify**: `npm run typecheck` passes
- **Complexity**: Small

### Phase 4: Verification

#### Step 4.1: Run all tests

- **Files**: N/A
- **Action**: Run `./bin/test` to confirm all existing and new tests pass
- **Verify**: All tests pass with zero failures
- **Complexity**: Small

#### Step 4.2: Run typecheck

- **Files**: N/A
- **Action**: Run `npm run typecheck`
- **Verify**: Zero type errors
- **Complexity**: Small

#### Step 4.3: Manual CLI verification

- **Files**: N/A (manual verification)
- **Action**: Verify CLI help output includes `--roast`
- **Manual test cases**:
  - `./reflect --help` → shows `--roast` option in output
  - `./reflect --username test --lookback 1` → runs without `--roast`
    (no regression)
- **Verify**: Help text displays correctly
- **Complexity**: Small

## Test Strategy

### Automated Tests

| Test Case | Type | Input | Expected Output |
| --- | --- | --- | --- |
| --roast flag present | Unit | `['--roast', ...]` | `generateRoast: true` |
| --roast flag absent | Unit | `[...]` (no --roast) | `generateRoast: false` |
| --roast with --brag | Unit | `['--roast', '--brag', ...]` | both true |

### Manual Verification

- [ ] `./reflect --help` shows `--roast` option with description
- [ ] CLI accepts `--roast` without error

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Tone too harsh | Discomfort | Prompt emphasizes playful humor |
| LLM ignores instructions | Boring output | Clear examples in prompt |

## Rollback Strategy

Revert the single commit. All changes are additive — no existing behavior
is modified.

## Status

- [x] Plan approved
- [x] Implementation started
- [x] Implementation complete
