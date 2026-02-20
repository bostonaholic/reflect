# Configuration Reference

This document covers all environment variables, LLM
provider settings, token creation, input validation
rules, and `.env` file format for Reflect.

## Environment Variables

The following list covers every environment variable
that Reflect recognizes. Variables are read from the
`.env` file at startup via the `dotenv` library, or
from the shell environment directly.

- **`GITHUB_TOKEN`** (required) --
  GitHub Personal Access Token with `repo` and
  `read:org` scopes. Used to authenticate all GitHub
  GraphQL API requests.
- **`OPENAI_API_KEY`** (required when using OpenAI
  provider with `--brag`) --
  API key for the OpenAI API. Required only when
  generating brag documents with `--provider openai`
  (the default provider).
- **`ANTHROPIC_API_KEY`** (required when using
  Anthropic provider with `--brag`) --
  API key for the Anthropic API. Required only when
  generating brag documents with
  `--provider anthropic`.
- **`OPENAI_BASE_URL`** (optional) --
  Custom base URL for the OpenAI API endpoint.
  Override this to route requests through a proxy or
  a compatible alternative API. When unset, the
  official OpenAI endpoint is used.
- **`ANTHROPIC_BASE_URL`** (optional) --
  Custom base URL for the Anthropic API endpoint.
  Override this to route requests through a proxy or
  a compatible alternative API. When unset, the
  official Anthropic endpoint is used.
- **`DEBUG`** (optional) --
  Set to `1` to enable verbose LLM output. Prints
  token usage (input, output, cached, total), model
  name, and request status after each LLM call.

## Creating a GitHub Token

Follow these steps to create a classic Personal
Access Token (PAT) for use with Reflect:

1. Open GitHub and navigate to **Settings** >
   **Developer Settings** > **Personal Access Tokens**
   > **Tokens (classic)**.
2. Click **Generate new token** >
   **Generate new token (classic)**.
3. Enter a descriptive note, such as
   `reflect-cli-token`.
4. Set an expiration period. Choose a duration that
   aligns with the intended usage window.
5. Select the following scopes:
   - **`repo`** -- Grants read access to private and
     public repository data, including pull requests
     and issues.
   - **`read:org`** -- Grants read access to
     organization membership data. Required for
     org-based filtering with `--include-orgs` and
     `--exclude-orgs`.
6. Click **Generate token** and copy the token value
   immediately. GitHub displays it only once.
7. Store the token in the `.env` file as described
   in the next section.

## `.env` File Format

Place a `.env` file in the repository root directory.
The `dotenv` library loads it automatically at startup.
Each line must follow the `KEY=VALUE` format with no
spaces around the `=` sign.

Example `.env` file with all supported variables:

```text
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://custom-openai-proxy.example.com
ANTHROPIC_BASE_URL=https://custom-anthropic-proxy.example.com
DEBUG=1
```

### Notes on the `.env` File

- Only `GITHUB_TOKEN` is always required. The setup
  script (`bin/setup`) checks for both `GITHUB_TOKEN`
  and `OPENAI_API_KEY` during initial setup.
- Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
  based on the chosen `--provider` value. Setting both
  is harmless but only the key matching the active
  provider is used.
- Omit `OPENAI_BASE_URL` and `ANTHROPIC_BASE_URL`
  unless routing through a proxy or compatible
  endpoint. When omitted, the official provider
  endpoints are used.
- Set `DEBUG=1` only when diagnosing LLM request
  issues. Remove it or leave it unset for normal
  operation.
- The `.env` file is git-ignored. Never commit
  tokens or API keys to version control.

## LLM Providers

Reflect supports two LLM providers for brag document
generation. Select a provider with the `--provider`
flag.

### OpenAI

- **Provider flag value:** `openai`
- **Default model:** `gpt-4.1`
- **Required environment variable:** `OPENAI_API_KEY`
- **Optional environment variable:**
  `OPENAI_BASE_URL`

OpenAI is the default provider. When `--provider` is
omitted, Reflect uses OpenAI. The default model is
`gpt-4.1`, which balances quality and cost for
document generation tasks.

### Anthropic

- **Provider flag value:** `anthropic`
- **Default model:** `claude-sonnet-4-6`
- **Required environment variable:**
  `ANTHROPIC_API_KEY`
- **Optional environment variable:**
  `ANTHROPIC_BASE_URL`

Select the Anthropic provider by passing
`--provider anthropic`. The default model is
`claude-sonnet-4-6`.

### Custom Model Selection

Override the default model for either provider with
the `--model` flag:

```bash
./reflect --username bostonaholic --lookback 6 \
  --provider openai --model gpt-4.1-mini --brag
```

```bash
./reflect --username bostonaholic --lookback 6 \
  --provider anthropic --model claude-sonnet-4-5 \
  --brag
```

The `--model` value is passed directly to the
provider API without validation. Ensure the chosen
model name matches a model available in the
provider's API.

## Input Validation Rules

The CLI validates all input before making any API
calls. Invalid input causes an immediate exit with
a descriptive error message.

### Username

- **Flag:** `--username`
- **Pattern:** `[a-zA-Z0-9_-]+`
- **Allowed characters:** Alphanumeric characters,
  hyphens (`-`), and underscores (`_`)
- **Validation:** Must match the full pattern. Any
  character outside the allowed set causes rejection.

The same pattern applies to organization names
provided via `--include-orgs` and `--exclude-orgs`.

### Date Range Modes

The CLI requires exactly one of the following
date range modes. Using more than one is an error.

#### Lookback Period

- **Flag:** `--lookback`
- **Type:** Positive integer
- **Range:** 1 to 36 inclusive
- **Validation:** The value must be greater than 0
  and must not exceed 36. Non-numeric values are
  rejected by the argument parser.

#### Since Date

- **Flag:** `--since`
- **Format:** `YYYY-MM-DD`
- **Validation:** Must be a valid calendar date in
  `YYYY-MM-DD` format. The date must be in the past
  (before or equal to today). The date must be
  within 36 months of the current date. When used,
  the tool fetches all activity from this date up
  to the current date.

#### Explicit Date Range

- **Flags:** `--start-date` and `--end-date`
- **Format:** `YYYY-MM-DD` for both
- **Validation:** Both flags must be provided
  together. Start date must be before or equal to
  end date. The range cannot exceed 36 months.

### Repository Format

- **Flags:** `--include-repos`, `--exclude-repos`
- **Format:** `owner/repo`
- **Owner pattern:** `[a-zA-Z0-9_-]+` (same as
  username)
- **Repo name pattern:** `[a-zA-Z0-9_.-]+`
- **Validation:** The value must contain exactly one
  `/` separating the owner and repository name. Both
  parts are validated independently against their
  respective patterns.

### Date Mode Mutual Exclusivity

- **`--lookback`**, **`--since`**, and
  **`--start-date`/`--end-date`** are mutually
  exclusive. Providing more than one mode causes an
  immediate exit with an error.

### Filter Mutual Exclusivity

- **`--include-orgs` and `--exclude-orgs`** cannot
  be used in the same command. Providing both causes
  an immediate exit with the error: "Cannot use both
  --include-orgs and --exclude-orgs simultaneously".
- **`--include-repos` and `--exclude-repos`** cannot
  be used in the same command. Providing both causes
  an immediate exit with the error: "Cannot use both
  --include-repos and --exclude-repos simultaneously".
- Organization filters and repository filters may be
  combined freely (for example, `--include-orgs`
  with `--exclude-repos`).
