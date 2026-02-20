# Reflect CLI Skills Plugin Design

## Goal

Create a Claude Code plugin with a single `reflect` skill
that helps end users set up, run, and troubleshoot the
Reflect CLI tool for generating brag documents.

## Plugin Structure

```text
.claude-plugin/
  plugin.json
skills/
  reflect/
    SKILL.md
    references/
      configuration.md
      troubleshooting.md
```

## Components

### plugin.json

Declares the plugin with name `reflect`, description,
and version.

### SKILL.md (~1,800 words)

**Frontmatter triggers:** "generate a brag document",
"set up reflect", "run reflect", "configure GitHub token",
"reflect not working", "brag doc errors", "reflect CLI"

**Body sections:**

1. **Overview** - What Reflect does: fetches GitHub
   activity (merged PRs, closed issues, PR reviews)
   and uses LLM APIs to generate professional brag
   documents for performance reviews.

2. **First-Time Setup** - Quick steps: clone repo,
   run `./bin/setup`, configure `.env` with
   `GITHUB_TOKEN` and LLM API key. Pointer to
   `references/configuration.md` for details.

3. **Running Reflect** - Core usage patterns:
   - Basic: `./reflect --username <user> --lookback <m>`
   - With brag doc: add `--brag`
   - Provider: `--provider openai|anthropic`, `--model`
   - Filtering: `--include-orgs`, `--exclude-orgs`,
     `--include-repos`, `--exclude-repos`
   - Mutual exclusivity rules for filters

4. **Understanding Output** - Four files in `output/`:
   - `contributions.md` - always generated
   - `review_contributions.md` - always generated
   - `summarized_contributions.md` - with `--brag`
   - `brag_document.md` - with `--brag`

5. **Common Issues** - Pointers to
   `references/troubleshooting.md`

6. **Additional Resources** - Links to reference files

### references/configuration.md

- `GITHUB_TOKEN` - required, `repo` and `read:org` scopes
- `OPENAI_API_KEY` - for OpenAI provider (default)
- `ANTHROPIC_API_KEY` - for Anthropic provider
- `OPENAI_BASE_URL` / `ANTHROPIC_BASE_URL` - custom URLs
- `DEBUG=1` - enable debug output for LLM calls
- `.env` file format and location
- Default models: `gpt-4.1` (OpenAI),
  `claude-sonnet-4-6` (Anthropic)
- Validation: lookback 1-36 months, username regex,
  repo format owner/repo

### references/troubleshooting.md

- **Auth failures**: expired/invalid GitHub token,
  wrong scopes, missing token
- **Rate limiting**: GitHub API rate limits, reset time
- **Missing API keys**: LLM key required only with
  `--brag`, provider-specific keys
- **Invalid arguments**: username format, month range,
  org/repo filter conflicts
- **Empty results**: no activity in lookback period,
  wrong username, filters too restrictive
- **File overwrites**: interactive prompt when output
  files exist
- **Debug mode**: `DEBUG=1` to inspect LLM calls

## Decisions

- Single skill (not split by task) because the CLI
  is a focused, single-purpose tool
- No scripts/ or examples/ needed - the skill is
  informational, not procedural
- Progressive disclosure: SKILL.md for quick reference,
  references/ for deep dives
- Plugin at repo root so it ships with the project
