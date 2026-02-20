---
name: reflect
description: >
  This skill should be used when someone needs to generate a
  brag document from GitHub activity, set up reflect for the
  first time, run reflect to fetch contributions, configure
  a GitHub token for reflect, filter contributions by
  organization or repository, choose between OpenAI and
  Anthropic providers, understand reflect output files,
  troubleshoot reflect not working, or debug brag doc errors.
---

# Reflect

Reflect is a CLI tool that fetches GitHub activity -- merged
pull requests, closed issues, and PR reviews -- and uses LLM
APIs to generate professional brag documents for performance
reviews. It connects to the GitHub GraphQL API via Octokit
to retrieve contribution data, then optionally passes that
data through an LLM provider (OpenAI or Anthropic) to
produce summarized and narrative-format documents. All output
is written as structured Markdown files suitable for
self-assessments, promotion packets, and manager reviews.

## First-Time Setup

### Prerequisites

Ensure the following are available before running Reflect
for the first time:

- **Node.js >= 22.15.1** -- Install via
  [nodenv](https://github.com/nodenv/nodenv) (preferred)
  or [nvm](https://github.com/nvm-sh/nvm). Verify the
  installed version by running `node --version`. Reflect
  uses TypeScript with ES2022 features that require this
  minimum version.
- **npm** -- Included with Node.js. Used by the setup
  script to install project dependencies.
- **GitHub Personal Access Token (PAT)** -- Create a
  classic token with `repo` and `read:org` scopes. Navigate
  to GitHub Settings > Developer Settings > Personal Access
  Tokens > Tokens (classic) to generate one. The `repo`
  scope grants access to private repository data. The
  `read:org` scope allows reading organization membership,
  which is needed for org-based filtering.
- **LLM API key** (optional, required only for brag
  document generation) -- Obtain an `OPENAI_API_KEY` from
  OpenAI or an `ANTHROPIC_API_KEY` from Anthropic. Only one
  key is needed, matching the chosen `--provider` flag.

### Install Dependencies and Configure Environment

Follow these steps to prepare the local environment:

1. Run the setup script from the repository root:

   ```bash
   ./bin/setup
   ```

   The setup script installs all npm dependencies via
   the bootstrap process, then validates that the required
   environment variables are present in the `.env` file.
   If any required variable is missing, the script exits
   with an error listing the missing variables.

2. Copy the example environment file and fill in values:

   ```bash
   cp .env.example .env
   ```

   The `.env.example` file contains placeholder entries
   for every supported environment variable. Copying it
   creates a local `.env` file that Reflect reads at
   startup using the `dotenv` library.

3. Edit `.env` and set the required variables:

   ```text
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
   ```

   Replace the placeholder values with real tokens. Set
   `ANTHROPIC_API_KEY` instead of `OPENAI_API_KEY` when
   planning to use the Anthropic provider. Ensure there
   are no spaces around the `=` sign in each line. The
   `.env` file must reside in the repository root
   directory.

For detailed environment variable documentation, including
optional base URL overrides and debug mode, see
[references/configuration.md](references/configuration.md).

## Running Reflect

### Basic Command Structure

```bash
./reflect --username <github-username> \
  --lookback <months> [options]
```

Reflect requires a GitHub username and a lookback period.
All other flags are optional. The tool loads environment
variables from `.env` at startup, fetches GitHub data via
the GraphQL API, generates the base contribution reports,
and optionally calls an LLM to produce summarized and
brag documents.

### Required Flags

- **`--username <username>`** --
  GitHub username to analyze. Must contain only
  alphanumeric characters, hyphens, and underscores
  (pattern: `[a-zA-Z0-9_-]+`). The tool validates this
  format before making any API calls and exits with an
  error if the format is invalid.
- **`--lookback <number>`** --
  Number of months to look back for activity. Must be a
  positive integer not exceeding 36. The tool calculates
  a date range from the current date backward by this
  many months and fetches all qualifying activity within
  that window.

### Optional Flags

- **`--brag`** --
  Enable brag document generation. When present, Reflect
  sends the contributions report to the configured LLM
  provider to generate both a summarized contributions
  file and a professional brag document. Requires a
  valid LLM API key in the `.env` file. Without this
  flag, only the raw contribution and review reports
  are generated.
- **`--provider <provider>`** --
  LLM provider to use for brag document generation.
  Valid values: `openai`, `anthropic`. Defaults to
  `openai`. The provider determines which API key
  environment variable is required (`OPENAI_API_KEY`
  for OpenAI, `ANTHROPIC_API_KEY` for Anthropic).
  The CLI validates the provider value and exits
  with an error if it is not recognized.
- **`--model <model>`** --
  LLM model to use for text generation. Defaults to
  `gpt-4.1` when the provider is `openai` and to
  `claude-sonnet-4-6` when the provider is `anthropic`.
  Override this to use a different model from the
  chosen provider, such as `gpt-4.1-mini` for OpenAI
  or `claude-sonnet-4-5` for Anthropic.
- **`--debug`** --
  Enable debug mode for detailed LLM API information.
  When present, Reflect logs additional diagnostic
  output including API request and response details
  such as token usage, model name, and completion
  status. Deprecated in favor of setting `DEBUG=1`
  in the environment.

### Filtering Flags

Use filtering flags to scope GitHub results to specific
organizations or repositories. These flags control which
contributions appear in the output.

- **`--include-orgs <orgs...>`** --
  Only include contributions from the listed
  organizations. Provide one or more organization names
  separated by spaces. Each name must match the GitHub
  username format (`[a-zA-Z0-9_-]+`).
- **`--exclude-orgs <orgs...>`** --
  Exclude contributions from the listed organizations.
  Provide one or more organization names separated by
  spaces. Each name must match the GitHub username
  format.
- **`--include-repos <repos...>`** --
  Only include contributions from the listed
  repositories. Provide one or more repository
  identifiers in `owner/repo` format, separated by
  spaces. Both the owner and repository name are
  validated.
- **`--exclude-repos <repos...>`** --
  Exclude contributions from the listed repositories.
  Provide one or more repository identifiers in
  `owner/repo` format, separated by spaces.

#### Mutual Exclusivity Rules

The CLI enforces the following constraints and exits
with an error message if violated:

- **`--include-orgs` and `--exclude-orgs`** cannot be
  used together. Choose one or the other to filter by
  organization.
- **`--include-repos` and `--exclude-repos`** cannot be
  used together. Choose one or the other to filter by
  repository.
- Organization filters and repository filters may be
  combined freely. For example, use `--include-orgs`
  together with `--exclude-repos` to include all
  contributions from certain organizations while
  excluding specific repositories.

### Example Commands

Generate a basic activity report for the last 6 months
(no LLM calls, produces only contribution and review
reports):

```bash
./reflect --username bostonaholic --lookback 6
```

Generate a full brag document with the default OpenAI
provider and default model (`gpt-4.1`):

```bash
./reflect --username bostonaholic --lookback 6 --brag
```

Use the Anthropic provider with a specific model:

```bash
./reflect --username bostonaholic --lookback 6 \
  --provider anthropic --model claude-sonnet-4-6 \
  --brag
```

Include only contributions from specific organizations:

```bash
./reflect --username bostonaholic --lookback 6 \
  --include-orgs shopify github
```

Exclude contributions from specific organizations:

```bash
./reflect --username bostonaholic --lookback 6 \
  --exclude-orgs secret archived
```

Include only contributions from specific repositories:

```bash
./reflect --username bostonaholic --lookback 6 \
  --include-repos bostonaholic/reflect \
  bostonaholic/dotfiles
```

Exclude contributions from specific repositories:

```bash
./reflect --username bostonaholic --lookback 6 \
  --exclude-repos bostonaholic/secret \
  bostonaholic/archived
```

Combine organization and repository filters:

```bash
./reflect --username bostonaholic --lookback 12 \
  --include-orgs shopify \
  --exclude-repos shopify/internal-tools \
  --brag
```

## Understanding Output

All output files are written to the `output/` directory
at the repository root. The directory is created
automatically on the first run if it does not exist. When
a file already exists, Reflect prompts for overwrite
confirmation before replacing it. Choosing not to
overwrite causes Reflect to use the existing file contents
for any downstream processing (such as feeding
contributions into the LLM summarizer). The `output/`
directory is git-ignored to prevent accidental commits of
generated content.

### Files Always Generated

These two files are produced on every run, regardless of
whether the `--brag` flag is present:

#### `output/contributions.md`

A chronological GitHub activity report containing all
merged pull requests and closed issues within the
lookback period. Each entry includes the title, closing
date, description body, and repository name. Items are
sorted by closing date with the most recent first. This
file provides the foundational data that feeds all
downstream reports. When `--brag` is enabled, this file
is sent to the LLM for summarization.

#### `output/review_contributions.md`

A report of PR review comments authored by the specified
user within the lookback period. Each entry includes the
review state (approved, changes requested, commented),
the review body text, and individual review comments.
This file captures code review activity, which is
distinct from code authoring contributions and often
reflects mentorship and collaboration efforts.

### Files Generated with `--brag`

These two files are produced only when the `--brag` flag
is present. They require a valid LLM API key
(`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`) to be set in
the `.env` file. Generation happens sequentially: the
summarized contributions are produced first, then the
brag document is generated from that summary.

#### `output/summarized_contributions.md`

An LLM-generated summary of the raw contributions
report. The LLM groups similar contributions together,
highlights key technical changes and improvements,
identifies recurring patterns across the work, and notes
significant architectural decisions. This intermediate
file serves as the input for the final brag document
and can also stand alone as a concise technical summary
for engineering-focused reviews.

#### `output/brag_document.md`

A professional brag document generated by the LLM from
the summarized contributions. The document is structured
to focus on business impact and value delivered,
emphasize collaboration and leadership moments, highlight
key metrics and improvements, and present achievements in
a narrative format. It is formatted for direct use in
performance reviews, promotion packets, or portfolio
presentations.

## Common Issues

Below is a quick reference for frequent problems. Each
entry describes the symptom and the recommended fix. For
detailed step-by-step troubleshooting procedures, see
[references/troubleshooting.md](references/troubleshooting.md).

- **"No .env file found"** -- Copy `.env.example` to
  `.env` and populate the required variables. Ensure no
  spaces surround the `=` sign in each entry. Verify the
  `.env` file is in the repository root directory.
- **GitHub API errors** -- Verify the `GITHUB_TOKEN` is
  set in `.env`, has both `repo` and `read:org` scopes,
  and has not expired. Re-generate the token if the
  scopes are incorrect.
- **Empty output files** -- Confirm the username is
  correct and that merged PRs or closed issues exist
  within the specified lookback period. Try increasing
  the `--lookback` value to capture a wider time range.
- **LLM API key errors** -- Ensure the correct API key
  variable is set: `OPENAI_API_KEY` for the `openai`
  provider or `ANTHROPIC_API_KEY` for the `anthropic`
  provider. Confirm the key is valid and has sufficient
  credits or quota remaining.
- **"Invalid GitHub username format"** -- The username
  must contain only alphanumeric characters, hyphens,
  and underscores. Remove any special characters or
  whitespace from the `--username` value.
- **"Months must be a positive number and not exceed
  36"** -- Provide a `--lookback` value between 1 and
  36 inclusive. The value must be a positive integer.
- **"Cannot use both --include-orgs and --exclude-orgs
  simultaneously"** -- Remove one of the conflicting
  flags and re-run the command. The same mutual
  exclusivity rule applies to `--include-repos` and
  `--exclude-repos`.
- **TypeScript or syntax errors at startup** -- Ensure
  Node.js >= 22.15.1 is installed. Run
  `node --version` to verify. Older versions lack
  support for the ES2022 features and TypeScript
  stripping that Reflect requires.
- **Rate limiting from GitHub** -- The GitHub GraphQL
  API enforces rate limits. Wait for the reset window
  indicated in the error message before retrying, or
  reduce the `--lookback` period to fetch less data.

## Additional Resources

- [Configuration Reference](references/configuration.md)
  -- Full documentation of all environment variables,
  LLM provider configuration, base URL overrides, debug
  mode, and `.env` file format.
- [Troubleshooting Guide](references/troubleshooting.md)
  -- Step-by-step diagnostic procedures for common
  errors, GitHub API issues, LLM provider failures, and
  environment setup problems.
