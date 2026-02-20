# Troubleshooting

This guide covers common errors encountered when running
Reflect, organized by category. Each entry follows a
problem/cause/fix structure.

## Authentication Failures

### Missing GITHUB_TOKEN

**Problem:** The CLI exits immediately with:

```text
Error: GITHUB_TOKEN environment variable is required
```

**Cause:** The `GITHUB_TOKEN` variable is not set in the
`.env` file or in the shell environment. The GitHub
integration checks for this variable before making any
API calls and calls `process.exit(1)` when it is absent.

**Fix:**

1. Run `./bin/setup` to copy `.env.example` to `.env`
   if it does not already exist.
2. Edit `.env` and add the token value:

   ```text
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   ```

3. Ensure there are no spaces around the `=` sign.
4. Re-run `./bin/setup` to validate, then run the
   command.

### Expired or Invalid Token

**Problem:** GitHub API requests fail with a GraphQL
error after the CLI starts fetching data. The spinner
shows a failure message such as:

```text
Failed to fetch PRs
```

or:

```text
Failed to fetch PR reviews
```

followed by a `GitHub API error:` message indicating
unauthorized access.

**Cause:** The token stored in `GITHUB_TOKEN` has expired,
has been revoked, or was entered incorrectly.

**Fix:**

1. Navigate to GitHub Settings > Developer Settings >
   Personal Access Tokens > Tokens (classic).
2. Verify the token has not expired. If it has, generate
   a new one.
3. Copy the new token value into the `.env` file.
4. Confirm the value contains no trailing whitespace or
   line breaks.

### Insufficient Token Scopes

**Problem:** API requests return partial data or fail
with permission errors. Organization-filtered queries
may return empty results even though contributions
exist.

**Cause:** The token lacks the required scopes. Reflect
needs `repo` (for private repository access) and
`read:org` (for organization membership data used in
org-based filtering).

**Fix:**

1. Open the token settings page on GitHub.
2. Verify both `repo` and `read:org` scopes are checked.
3. If either scope is missing, regenerate the token with
   both scopes enabled.
4. Update the `GITHUB_TOKEN` value in `.env`.

## GitHub API Rate Limiting

### Rate Limit Exceeded

**Problem:** The CLI fails during data fetching with:

```text
GitHub API rate limit exceeded. Resets at <time>
```

where `<time>` is a localized time string (e.g.,
`2:30:00 PM`).

**Cause:** The GitHub GraphQL API enforces hourly rate
limits. Large lookback periods or accounts with
extensive activity can consume the quota quickly,
especially when pagination fetches many pages of
results.

**Fix:**

1. Note the reset time displayed in the error message.
   Wait until that time before retrying.
2. Reduce the `--lookback` value to fetch less data
   per run.
3. Narrow results with `--include-orgs` or
   `--include-repos` to reduce the number of API
   calls.

## Missing LLM API Keys

### No API Key When Using --brag

**Problem:** The CLI throws an error during brag
document generation:

```text
LLM API key environment variable is required for
brag document generation
```

**Cause:** The `--brag` flag was passed, but no API key
is set for the configured provider. The orchestration
layer checks for the key after GitHub data is fetched
and before calling the LLM.

**Fix:**

1. Determine which provider is in use. The default is
   `openai`. Check whether `--provider` was specified.
2. Set the corresponding environment variable in `.env`:

   - For `openai`: set `OPENAI_API_KEY`
   - For `anthropic`: set `ANTHROPIC_API_KEY`

   ```text
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
   ```

3. Confirm the key is valid and has available quota.
4. Re-run the command.

### Provider-Specific Key Requirements

Each provider reads from a different environment
variable:

| Provider    | Environment Variable  |
|-------------|-----------------------|
| `openai`    | `OPENAI_API_KEY`      |
| `anthropic` | `ANTHROPIC_API_KEY`   |

Setting `OPENAI_API_KEY` has no effect when running
with `--provider anthropic`, and vice versa. Always
match the key to the provider.

## Invalid Arguments

### Invalid Username Format

**Problem:** The CLI exits with:

```text
Error: Invalid GitHub username format
```

**Cause:** The `--username` value contains characters
outside the allowed pattern `[a-zA-Z0-9_-]+`. Spaces,
dots, and special characters are not permitted.

**Fix:**

1. Verify the GitHub username is correct by visiting
   the profile page at `github.com/<username>`.
2. Remove any special characters, spaces, or leading
   `@` symbols from the value.
3. Re-run with the corrected username.

### Lookback Out of Range

**Problem:** The CLI exits with:

```text
Error: Months must be a positive number and not
exceed 36
```

**Cause:** The `--lookback` value is less than 1, greater
than 36, or not a valid number. The value must be a
positive integer in the range 1 to 36 inclusive.

**Fix:**

1. Choose a lookback value between 1 and 36.
2. Ensure the value is a whole number (e.g., `6`, not
   `6.5`).

### Invalid Since Date

**Problem:** The CLI exits with one of:

```text
Error: Invalid since date format. Use YYYY-MM-DD
```

```text
Error: Since date must be in the past
```

```text
Error: Since date cannot be more than 36 months ago
```

**Cause:** The `--since` value is not a valid
`YYYY-MM-DD` date, is in the future, or is more
than 36 months before today.

**Fix:**

1. Use `YYYY-MM-DD` format (e.g., `2025-01-01`).
2. Ensure the date is in the past.
3. Ensure the date is within the last 36 months.

### Conflicting Date Modes

**Problem:** The CLI exits with:

```text
Error: Cannot combine --lookback, --since, and
--start-date/--end-date
```

**Cause:** More than one date range mode was
specified. The `--lookback`, `--since`, and
`--start-date`/`--end-date` flags are mutually
exclusive.

**Fix:**

1. Choose exactly one date range mode.
2. Remove any extra date flags from the command.

### Using Both --include-orgs and --exclude-orgs

**Problem:** The CLI exits with:

```text
Error: Cannot use both --include-orgs and
--exclude-orgs simultaneously
```

**Cause:** The CLI enforces mutual exclusivity between
include and exclude organization filters. Providing
both at the same time is not allowed.

**Fix:**

1. Remove one of the two flags.
2. Use `--include-orgs` to allow-list specific
   organizations, or `--exclude-orgs` to block-list
   them -- not both.

### Using Both --include-repos and --exclude-repos

**Problem:** The CLI exits with:

```text
Error: Cannot use both --include-repos and
--exclude-repos simultaneously
```

**Cause:** The CLI enforces mutual exclusivity between
include and exclude repository filters. Providing
both at the same time is not allowed.

**Fix:**

1. Remove one of the two flags.
2. Use `--include-repos` to allow-list specific
   repositories, or `--exclude-repos` to block-list
   them -- not both.

### Invalid Repository Format

**Problem:** The CLI exits with:

```text
Error: Invalid repository names: <names>
```

**Cause:** One or more repository identifiers do not
match the required `owner/repo` format. The owner must
match `[a-zA-Z0-9_-]+` and the repository name must
match `[a-zA-Z0-9_.-]+`. Values like `myrepo` (missing
owner) or `owner/repo/extra` (too many segments) are
rejected.

**Fix:**

1. Use the full `owner/repo` format for each
   repository (e.g., `bostonaholic/reflect`).
2. Ensure both the owner and repository name contain
   only allowed characters.

### Invalid Provider Name

**Problem:** The CLI exits with:

```text
Error: Invalid provider <name>
```

followed by:

```text
Valid providers are: openai, anthropic
```

**Cause:** The `--provider` value does not match any
recognized LLM provider. The valid values are `openai`
and `anthropic`.

**Fix:**

1. Use one of the supported provider names:

   ```bash
   --provider openai
   ```

   or:

   ```bash
   --provider anthropic
   ```

2. Omit the flag entirely to use the default provider
   (`openai`).

## Empty Results

### No Activity in Lookback Period

**Problem:** The generated contribution files contain
no entries. The CLI completes successfully but the
output files are empty or contain only headers.

**Cause:** No merged pull requests, closed issues, or
PR reviews exist for the specified username within the
calculated date range.

**Fix:**

1. Increase the `--lookback` value to capture a wider
   time window.
2. Verify the username has activity by checking the
   GitHub profile contributions page.

### Filters Too Restrictive

**Problem:** Output files are empty despite known
activity in the lookback period.

**Cause:** Organization or repository filters exclude
all contributions. This can happen when using
`--include-orgs` with an organization that has no
merged PRs in the time range, or when `--exclude-repos`
removes all active repositories.

**Fix:**

1. Run the command without any filtering flags first
   to confirm activity exists.
2. Adjust the filters to be less restrictive.
3. Double-check organization and repository names for
   typos.

### Wrong Username

**Problem:** Output files are empty or contain
contributions that do not belong to the expected
person.

**Cause:** The `--username` value does not match the
intended GitHub account. GitHub usernames are
case-insensitive for profile pages but the search
query uses the exact value provided.

**Fix:**

1. Confirm the correct username by visiting
   `github.com/<username>`.
2. Re-run the command with the verified username.

## File Overwrite Prompts

### Existing Files in output/ Directory

**Problem:** The CLI pauses with an interactive prompt:

```text
File output/<filename> already exists. Overwrite?
(y/N)
```

**Cause:** A previous run already generated the output
file. Reflect checks for existing files before writing
and prompts for confirmation to prevent accidental data
loss. The allowed output files are:
`contributions.md`, `review_contributions.md`,
`summarized_contributions.md`, and
`brag_document.md`.

**Fix:**

- Enter `y` to overwrite the existing file with new
  content.
- Enter `N` (or press Enter, since `N` is the default)
  to keep the existing file. Reflect reads the existing
  file contents and uses them for any downstream
  processing (e.g., feeding contributions into the LLM
  summarizer).

### How the Interactive Prompt Works

The prompt appears once per file that already exists.
In a typical `--brag` run that produces four files,
up to four prompts may appear if all files exist from
a previous run.

When choosing not to overwrite, the CLI logs:

```text
Using existing contents of output/<filename>
```

This means the existing file contents are reused for
subsequent steps. For example, declining to overwrite
`contributions.md` causes the LLM summarizer to work
from the previously generated contributions rather
than freshly fetched data.

## Debugging with DEBUG=1

### Enabling Debug Mode

Set the `DEBUG` environment variable to `1` to enable
verbose output from the LLM integration layer:

```bash
DEBUG=1 ./reflect --username bostonaholic \
  --lookback 6 --brag
```

### What Debug Output Shows

When debug mode is active, each LLM API call prints
additional information after completion. The exact
fields depend on the provider.

**OpenAI debug output:**

```text
[DEBUG] LLM Information:
[DEBUG] Input Tokens: <number>
[DEBUG] Output Tokens: <number>
[DEBUG] Total Tokens: <number>
[DEBUG] Cached Input Tokens: <number>
[DEBUG] Model: <model-name>
[DEBUG] Status: <status>
```

The `Cached Input Tokens` field shows how many tokens
were served from the OpenAI prompt cache, which can
reduce latency and cost on repeated requests.

**Anthropic debug output:**

```text
[DEBUG] LLM Information:
[DEBUG] Prompt Tokens: <number>
[DEBUG] Completion Tokens: <number>
[DEBUG] Total Tokens: <number>
[DEBUG] Model: <model-name>
[DEBUG] Finish Reason: <reason>
```

The `Finish Reason` field indicates why the model
stopped generating (e.g., `end_turn` for normal
completion, `max_tokens` if the response was
truncated).

### --debug Flag Deprecation

The `--debug` CLI flag is deprecated. When used, the
CLI prints:

```text
Warning: --debug is deprecated. Use DEBUG=1 in your
environment instead.
```

The flag still works during the deprecation period but
will be removed in a future release. Switch to the
`DEBUG=1` environment variable for forward
compatibility.
