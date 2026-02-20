# Reflect CLI Skills Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan
> task-by-task.

**Goal:** Create a Claude Code plugin with a single
`reflect` skill that helps end users set up, run, and
troubleshoot the Reflect CLI.

**Architecture:** Skill-focused plugin with no commands,
agents, or hooks. One skill with progressive disclosure
via two reference files.

**Tech Stack:** Claude Code plugin system, Markdown,
JSON

---

## Task 1: Create plugin manifest

Files:

- Create: `.claude-plugin/plugin.json`

### Step 1: Create the plugin manifest

Create `.claude-plugin/plugin.json` with:

```json
{
  "name": "reflect",
  "version": "0.1.0",
  "description": "Skills for using the Reflect CLI"
}
```

### Step 2: Commit the manifest

```bash
git add .claude-plugin/plugin.json
git commit -m "Add plugin manifest for Reflect CLI skills"
```

---

## Task 2: Create SKILL.md

Files:

- Create: `skills/reflect/SKILL.md`

### Step 1: Create the skill file

Create `skills/reflect/SKILL.md` with YAML frontmatter
and body covering:

- Frontmatter: name `reflect`, description with
  third-person trigger phrases ("generate a brag
  document", "set up reflect", "run reflect",
  "configure GitHub token", "reflect not working",
  "brag doc errors")
- Overview: 2-3 sentences on what Reflect does
- First-Time Setup: Prerequisites (Node >= 22.15.1,
  GitHub token), run `./bin/setup`, configure `.env`.
  Pointer to `references/configuration.md`.
- Running Reflect: All CLI flags and usage patterns
  - Required: `--username`, `--lookback`
  - Optional: `--brag`, `--provider`, `--model`
  - Filtering: `--include-orgs`, `--exclude-orgs`,
    `--include-repos`, `--exclude-repos`
  - Mutual exclusivity rules
  - Example commands
- Understanding Output: Four files in `output/`
  with descriptions of each
- Common Issues: Quick list with pointer to
  `references/troubleshooting.md`
- Additional Resources: Links to both reference
  files

Target ~1,800 words. Use imperative/infinitive form
throughout. No second person.

Source files to reference for accuracy:

- `lib/core/cli.ts` - all CLI flags and validation
- `lib/core/reflect.ts` - orchestration flow
- `lib/utils/file-utils.ts:6` - ALLOWED_FILES list
- `lib/integrations/llm/openai.ts` - default model
- `lib/integrations/llm/anthropic.ts` - default model
- `README.md` - user-facing docs and examples

### Step 2: Commit the skill

```bash
git add skills/reflect/SKILL.md
git commit -m "Add reflect skill with setup and usage guide"
```

---

## Task 3: Create references/configuration.md

Files:

- Create: `skills/reflect/references/configuration.md`

### Step 1: Create the configuration reference

Create `skills/reflect/references/configuration.md`
covering:

- Environment Variables section with a table:
  - `GITHUB_TOKEN` (required) - scopes: `repo`,
    `read:org`
  - `OPENAI_API_KEY` - required when using OpenAI
    provider with `--brag`
  - `ANTHROPIC_API_KEY` - required when using Anthropic
    provider with `--brag`
  - `OPENAI_BASE_URL` - custom OpenAI endpoint
  - `ANTHROPIC_BASE_URL` - custom Anthropic endpoint
  - `DEBUG` - set to `1` for verbose LLM output
- Creating a GitHub Token - step-by-step
- `.env` File Format - example with all variables
- LLM Providers section:
  - OpenAI: default model `gpt-4.1`
  - Anthropic: default model `claude-sonnet-4-6`
  - Custom model via `--model`
- Input Validation Rules:
  - Username: alphanumeric, hyphens, underscores
  - Lookback: 1-36 months
  - Repository format: `owner/repo`
  - Org/repo filter mutual exclusivity

Source files to reference for accuracy:

- `lib/core/cli.ts` - validation regexes and rules
- `lib/integrations/llm/openai.ts` - default model,
  base URL env var
- `lib/integrations/llm/anthropic.ts` - default model,
  base URL env var
- `.env.example` or `bin/setup` - env var names
- `lib/integrations/github/github.ts` - token usage

### Step 2: Commit the configuration reference

```bash
git add skills/reflect/references/configuration.md
git commit -m "Add configuration reference for reflect skill"
```

---

## Task 4: Create references/troubleshooting.md

Files:

- Create: `skills/reflect/references/troubleshooting.md`

### Step 1: Create the troubleshooting reference

Create `skills/reflect/references/troubleshooting.md`
with problem/cause/fix format covering:

- Authentication Failures
  - Missing `GITHUB_TOKEN`
  - Expired or invalid token
  - Insufficient scopes
- GitHub API Rate Limiting
  - Rate limit exceeded error
  - Reset time display
- Missing LLM API Keys
  - Error when using `--brag` without API key
  - Provider-specific key requirements
- Invalid Arguments
  - Invalid username format
  - Lookback out of range (1-36)
  - Using both `--include-orgs` and `--exclude-orgs`
  - Using both `--include-repos` and `--exclude-repos`
  - Invalid repository format (must be `owner/repo`)
- Empty Results
  - No activity in lookback period
  - Filters too restrictive
  - Wrong username
- File Overwrite Prompts
  - Existing files in `output/`
  - How the interactive prompt works
- Debugging with DEBUG=1
  - What debug output shows (token counts, model info)
  - `--debug` flag deprecation notice

Source files to reference for accuracy:

- `lib/core/cli.ts` - error messages and validation
- `lib/integrations/github/github.ts` - rate limit
  handling, auth errors
- `lib/utils/file-utils.ts` - overwrite prompt logic
- `lib/utils/debug-utils.ts` - debug mode
- `lib/integrations/llm/openai.ts` - debug output
- `lib/integrations/llm/anthropic.ts` - debug output

### Step 2: Commit the troubleshooting reference

```bash
git add skills/reflect/references/troubleshooting.md
git commit -m "Add troubleshooting reference for reflect skill"
```

---

## Task 5: Validate plugin structure

### Step 1: Verify all files exist and are well-formed

Check that:

- `.claude-plugin/plugin.json` is valid JSON with
  `name` field
- `skills/reflect/SKILL.md` has valid YAML frontmatter
  with `name` and `description`
- `skills/reflect/references/configuration.md` exists
- `skills/reflect/references/troubleshooting.md` exists
- All file references in SKILL.md point to files that
  exist
- SKILL.md uses imperative form, not second person
- SKILL.md description uses third person with trigger
  phrases
- SKILL.md body is under 3,000 words

### Step 2: Run the plugin-validator agent

Use the `plugin-dev:plugin-validator` agent to validate
the plugin structure.

### Step 3: Run the skill-reviewer agent

Use the `plugin-dev:skill-reviewer` agent to review
skill quality.

### Step 4: Fix any issues found, commit if changes made
