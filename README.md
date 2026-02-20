# Reflect

![Reflect: An AI tool to generate your brag document](assets/github-header-image.png)

> [!IMPORTANT]
> While this tool helps document your GitHub contributions, it's crucial to remember that your impact and value to a company extends far beyond what's visible in GitHub. Many critical aspects of software engineering - such as mentoring, documentation, cross-team collaboration, and technical leadership - often happen outside of version control. For more on this topic, check out [Glue Work](https://www.noidea.dog/glue), an excellent resource about the often-overlooked but essential work that makes teams successful.

## Quickstart 🚀

### Prerequisites ⚙️

1. Install [nodenv](https://github.com/nodenv/nodenv) (preferred) or [nvm](https://github.com/nvm-sh/nvm)
2. Install npm or yarn package manager
3. GitHub Personal Access Token (PAT) with `repo` and `read:org` scopes
4. OpenAI API key (optional, for summary and brag document generation)

### Usage 💻

Set up your environment variables:

```bash
cp .env{.example,}
```

Optionally, encrypt your `.env` file with [dotenvx](https://dotenvx.com):

```bash
npx dotenvx encrypt
```

This encrypts secrets in `.env` and creates a `.env.keys`
file with your private decryption key. Keep `.env.keys`
safe and never commit it.

Run the setup script to configure your environment:

```bash
./bin/setup
```

Run the tool:

```bash
./reflect --username <github-username> --lookback <months-to-look-back> --brag
```

This will generate four markdown files in the `output` directory:

- A detailed list of your GitHub contributions
- A report of your PR review contributions
- A summarized version of your contributions
- A professional brag document highlighting your achievements

## Features ✨

- 📥 Fetches merged pull requests and closed issues from GitHub
- 🔍 Filters by author and date range (last 6 months by default)
- 📝 Generates a clean, chronological markdown document
- 🔄 Combines both PRs and issues into a single reflection document
- ⚡ Uses GitHub's official Octokit API client for efficient data retrieval
- 🤖 Optional AI-powered summary and brag document generation
- 🔒 Secure handling of API keys and sensitive data

## Usage 🛠️

Run the tool:

```bash
./reflect --username <github-username> --lookback <months-to-look-back> [--brag]
```

Example:

```bash
./reflect --username bostonaholic --lookback 6 --brag
```

### Arguments 📋

**Required:**

- `--username <username>`: Your GitHub username to fetch activity for

**Date range (one required, mutually exclusive):**

- `--lookback <number>`: Number of months to look back for activity (1-36)
- `--since <date>`: Start date in YYYY-MM-DD format; fetches activity from this date to today
- `--start-date <date>` + `--end-date <date>`: Specify an exact date range (both required)

**Optional:**

- `--provider <provider>`: LLM provider to use (e.g., openai, anthropic), defaults to openai
- `--model <model>`: LLM model to use. For OpenAI (e.g., gpt-4.1, gpt-4.1-mini), defaults to gpt-4.1. For Anthropic (e.g., claude-sonnet-4-6, claude-sonnet-4-5), defaults to claude-sonnet-4-6
- `--brag`: Optional flag to generate a summary and brag document
- `--include-orgs <orgs...>`: Only include contributions from these organizations (mutually exclusive with --exclude-orgs)
- `--exclude-orgs <orgs...>`: Exclude contributions from these organizations (mutually exclusive with --include-orgs)
- `--include-repos <repos...>`: Only include contributions from these repositories (mutually exclusive with --exclude-repos)
- `--exclude-repos <repos...>`: Exclude contributions from these repositories (mutually exclusive with --include-repos)

### Examples 🚀

Basic usage:

```bash
./reflect --username bostonaholic --lookback 6 --brag
```

Fetch activity since a specific date:

```bash
./reflect --username bostonaholic --since 2025-01-01 --brag
```

Choose a model:

```bash
./reflect --username bostonaholic --lookback 6 --model gpt-3-5-turbo --brag
```

Choose an LLM provider and model

```bash
./reflect --username bostonaholic --lookback 6 --provider anthropic --model claude-sonnet-4-6 --brag
```

Filter by specific organizations:

```bash
./reflect --username bostonaholic --lookback 6 --include-orgs shopify github
```

Exclude specific organizations:

```bash
./reflect --username bostonaholic --lookback 6 --exclude-orgs secret archived
```

Filter by specific repositories:

```bash
./reflect --username bostonaholic --lookback 6 --include-repos bostonaholic/reflect bostonaholic/dotfiles
```

Exclude specific repositories:

```bash
./reflect --username bostonaholic --lookback 6 --exclude-repos bostonaholic/secret bostonaholic/archived
```

### Environment Variables 🔐

Required environment variables:

- `GITHUB_TOKEN`: Your GitHub Personal Access Token (required)

To create a GitHub Personal Access Token:

1. Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
3. Copy the token and add it to your `.env` file

Required for making LLM calls (one of):

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

Optional for using a different provider-compatible endpoint:

- `OPENAI_BASE_URL`
- `ANTHROPIC_BASE_URL`

## Security Considerations 🔒

- API keys are only accepted through environment variables, not command-line arguments
- All file operations are sanitized to prevent path traversal attacks
- GitHub API rate limits are properly handled with informative error messages
- Input validation is performed on all user-provided parameters
- Output files are restricted to a predefined list of allowed filenames
- GitHub tokens are never logged or exposed in error messages

## Output 📁

The script will generate one or more markdown files in the `output` directory:

### output/contributions.md 📊

Contains:

- A chronological list of your merged pull requests and closed issues
- Each item includes:
  - Title
  - Closing date
  - Description/body
- Items are sorted by closing date (most recent first)
- Activity for the specified time period

### output/summarized_contributions.md (with --brag flag) 📝

Contains:

- A technical summary of your contributions
- Groups similar contributions together
- Highlights key technical changes and improvements
- Identifies patterns in the work
- Notes significant architectural changes

### output/brag_document.md (with --brag flag) 🎯

Contains:

- A professional brag document highlighting your achievements
- Focuses on business impact and value
- Emphasizes collaboration and leadership
- Highlights key metrics and improvements
- Suitable for performance reviews or portfolio

Note: The `output` directory and all generated files are automatically git-ignored to prevent accidental commits.

## Troubleshooting 🔍

If you get TypeScript errors, ensure you're using Node.js v22 or higher:

```bash
node --version
```

If you get GitHub API errors:

- Verify your GitHub Personal Access Token (PAT) is correctly set in your `.env` file
- Check that your PAT has the required scopes (`repo` and `read:org`)
- Ensure your PAT hasn't expired (they can be set to expire after a certain time)
- Verify you have access to the repositories you're trying to fetch data from

If the script runs but generates an empty file:

- Check that you have activity in the specified time period
- Verify your GitHub username is correct
- Ensure you have the necessary permissions to access the repositories

If you get an error about the OpenAI API key:

- Make sure you've set it in your `.env` file
- Check that the API key is valid and has sufficient credits
- Verify the .env file is in the correct location

If you get environment variable errors:

- Ensure your `.env` file exists and is properly formatted
- Check that there are no spaces around the `=` sign in your `.env` file
- Verify the `.env` file is in the root directory of the project

## Claude Code Integration 🤖

This repository includes a
[Claude Code](https://docs.anthropic.com/en/docs/claude-code)
plugin that provides an interactive skill for working
with Reflect. The skill helps with setup, running the
CLI, and troubleshooting common issues.

### Installing the Plugin

Add the marketplace and install the plugin:

```bash
/plugin marketplace add bostonaholic/reflect
/plugin install reflect@reflect
```

Or, if already working inside the Reflect repository,
Claude Code automatically discovers the plugin from
the `.claude-plugin/` directory.

### What the Skill Provides

Once installed, the `reflect` skill activates
automatically when asking Claude Code about:

- Setting up Reflect for the first time
- Running the CLI with flags and filters
- Choosing between OpenAI and Anthropic providers
- Understanding output files
- Troubleshooting errors

No slash commands or special syntax needed -- just
ask naturally (e.g., "how do I generate a brag
document?" or "reflect is giving me an auth error").

## Links 🔗

- 🗞️ [Hacker News](https://news.ycombinator.com/item?id=43519484)
- 🐦 [X](https://x.com/bostonaholic/status/1906119726948073824)
- 💼 [LinkedIn](https://www.linkedin.com/posts/bostonaholic_github-bostonaholicreflect-an-ai-tool-activity-7311885477546991616-JDzT)
