# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.22.2] - 2026-08-07

### Changed

- Updated the `openai` client from 6.45.0 to 7.1.0.
- Updated the `@anthropic-ai/sdk` package from 0.95.2 to 0.115.0.
- Updated the `@dotenvx/dotenvx` package from 2.0.0 to 2.19.2.

### Fixed

- Fixed `--version` always reporting `0.1.0`; it now reports the version recorded in `package.json`.

## [0.22.1] - 2026-07-12

### Changed

- Updated the `commander` command-line framework from 14.0.1 to 15.0.0.
- Updated the `@dotenvx/dotenvx` package from 1.52.0 to 2.0.0.
- Updated the `openai` client from 6.33.0 to 6.45.0.

## [0.22.0] - 2026-05-13

### Changed

- Bumped the Anthropic provider's default model from `claude-sonnet-4-6` to `claude-opus-4-7`.
- Bumped the OpenAI provider's default model from `gpt-4.1` to `gpt-5.5`.
- Updated the `@anthropic-ai/sdk` package from 0.81.0 to 0.95.2.

### Removed

- Removed the hardcoded `temperature: 0.7` parameter from OpenAI requests; GPT-5-series models reject the parameter, and the API default is sufficient.

## [0.21.0] - 2026-04-08

### Added

- Added a `dev.yml` task definition so setup, tests, type checking, and the REPL run through the `dev` CLI as `dev up`, `dev test`, `dev check typecheck`, and `dev console`.

### Changed

- Updated the `openai` client from 6.25.0 to 6.33.0.
- Updated the `@anthropic-ai/sdk` package from 0.78.0 to 0.81.0.

### Removed

- Removed the `bin/` helper scripts in favor of the `dev` tasks.
- Removed the interactive `bin/setup` script, along with its validation of the required variables and its offer to encrypt `.env`; `dev up` copies `.env.example` to `.env` when it is missing and never prompts.
- Removed the automatic dependency update that ran before every `reflect` invocation.

## [0.20.0] - 2026-03-10

### Added

- Added prompt caching to Anthropic requests, so repeated generations within the cache window cost less and return faster.
- Added cache creation and cache read token counts to the `DEBUG` output for Anthropic requests.

### Changed

- Changed startup output so loading environment variables no longer shows a spinner or a success message; a missing `.env` file prints a plain warning instead.

## [0.19.0] - 2026-03-07

### Added

- Added a `--roast` flag that generates a playful roast document of your GitHub contributions at `output/roast_document.md`, as a counterpart to `--brag`.

## [0.18.0] - 2026-02-25

### Added

- Added a `--star` flag that generates accomplishments in STAR (Situation, Task, Action, Result) format and writes them to `output/star_document.md`.

### Changed

- Changed fetch progress reporting so that when more than one `--include-orgs` or `--include-repos` value is supplied, each activity type reports a single combined count instead of a separate line per organization or repository.

### Fixed

- Fixed searches still returning zero results when more than one `--include-orgs` or `--include-repos` value was supplied. The `OR` query introduced in 0.15.1 did not cover every case, so each organization and repository is queried separately and the results deduplicated by URL.
- Fixed a crash when GitHub's GraphQL search returned null entries among its results.

## [0.17.0] - 2026-02-20

### Added

- Added `--start-date` and `--end-date` for reporting over an explicit date range instead of a rolling `--lookback` window.
- Added `--since` for an open-ended range running from a given date up to today.
- Added validation of the new date options, covering `YYYY-MM-DD` format, chronological order, and a 36-month maximum span.
- Added a first-run step to `bin/setup` that copies `.env.example` to `.env` and stops, so the tokens can be filled in before re-running.
- Added an offer in `bin/setup` to encrypt `.env` with dotenvx once the required variables validate.

### Changed

- Changed `--lookback` from a required option to one of three mutually exclusive date modes, alongside `--since` and the `--start-date`/`--end-date` pair.
- Changed `.env.example` to drop its placeholder secret values and group the variables into required, LLM-provider (at least one), and optional base-URL sections.
- Changed dates in generated documents to render in UTC, so an explicit `--start-date` or `--end-date` is displayed exactly as entered.

## [0.16.0] - 2026-02-20

### Added

- Added optional encryption for `.env` files through `@dotenvx/dotenvx`; `bin/setup` detects an encrypted `.env` and requires a `.env.keys` file before loading variables.
- Added progress spinners while documents are generated, so long LLM calls no longer look like the tool has stalled.
- Added a per-file prompt to reuse an existing `output/contributions.md` or `output/review_contributions.md`, which skips the GitHub fetch entirely when both are reused.
- Added a Claude Code plugin containing a `reflect` skill, with configuration and troubleshooting references.

### Changed

- Changed the default OpenAI model from `gpt-4o` to `gpt-4.1`, and the default Anthropic model from `claude-3-7-sonnet-20250219` to `claude-sonnet-4-6`.
- Replaced `dotenv` with `@dotenvx/dotenvx`, which still reads plain, unencrypted `.env` files.
- Moved the developer scripts from `script/` to `bin/`, so setup runs as `bin/setup`.
- Changed the spinner messages shown during generation to name the document being produced instead of the LLM provider.

### Fixed

- Fixed the "multiple concurrent spinners" warning printed while fetching GitHub data.

## [0.15.3] - 2026-02-16

### Changed

- Updated the `openai` client from 5.20.2 to 6.22.0.
- Updated the `@anthropic-ai/sdk` package from 0.57.0 to 0.71.0.
- Updated the `ora` terminal spinner library from 8.2.0 to 9.1.0.

## [0.15.2] - 2025-09-21

### Changed

- Updated the `dotenv` environment variable loader from 16.5.0 to 17.2.2.
- Updated the `openai` client from 5.10.2 to 5.20.2.

## [0.15.1] - 2025-08-02

### Changed

- Changed multi-value `--include-orgs` and `--include-repos` filters to be combined with an explicit `OR` inside parentheses in GitHub search queries, ahead of GitHub treating a space between qualifiers as `AND`. A single value is still emitted without parentheses, and exclusions are still space-separated.
- Changed overwrite prompts and reuse messages to show the path including the output directory, such as `output/contributions.md`, instead of the bare filename.
- Updated the `openai` client from 4.100.0 to 5.10.2.
- Updated the `@octokit/graphql` client from 8.2.2 to 9.0.1.
- Updated the `@anthropic-ai/sdk` package from 0.51.0 to 0.57.0.

### Fixed

- Fixed blank and whitespace-only values passed to the organization and repository filters producing malformed search queries.

## [0.15.0] - 2025-06-04

### Added

- Added `--include-repos` and `--exclude-repos` to restrict contributions to, or exclude them from, specific repositories; passing both at once is rejected with an error, and each value is validated as `owner/name`.

### Changed

- Raised the minimum supported Node.js version to 22.15.1; runs on 22.15.0 are no longer supported.
- Updated the `commander` command-line framework from 13.1.0 to 14.0.0.

### Removed

- Removed the short-form aliases for every command-line option (`-u`, `-l`, `-p`, `-m`, `-b`, `-d`, `-i`, `-e`); use the long forms such as `--username` and `--lookback` instead.

## [0.14.1] - 2025-05-19

### Changed

- Prefixed the document generation progress messages with an info icon.
- Raised the minimum supported Node.js version to 22.15.0; runs on 22.14.x are no longer supported.
- Updated the `@anthropic-ai/sdk` package from 0.39.0 to 0.50.3.

### Fixed

- Fixed the system prompt being sent to Anthropic models as an assistant message instead of in the `system` parameter.
- Fixed the error message shown when fetching pull request reviews fails, which read `Failed to PR reviews`.

## [0.14.0] - 2025-05-03

### Added

- Added shell execution tracing to the `reflect` executable and the `script/` helpers when `DEBUG=1` is set.

## [0.13.0] - 2025-04-09

### Added

- Added `output/review_contributions.md`, which lists the pull requests you reviewed that merged during the reporting window, together with your review verdicts, review comments, and issue comments on those pull requests.

## [0.12.0] - 2025-04-05

### Added

- Added the `reflect` executable as the primary way to run the tool; it brings dependencies up to date and then runs the CLI.

### Changed

- Changed the default OpenAI model to `gpt-4o` and removed the 1000-token output cap, so generated documents are no longer truncated.
- Changed the debug output for OpenAI requests to report input, output, cached input, and total token counts along with the request status.
- Rewrote the brag document and contributions summary prompts with explicit, deterministic formatting rules, and moved the static instructions to the top of each prompt to improve prompt caching.
- Changed an empty model response to write `Empty response from OpenAI` or `Empty response from Anthropic` instead of an empty document.

### Deprecated

- Deprecated the `--debug` flag in favor of setting `DEBUG=1` in the environment; passing `--debug` prints a deprecation warning.
- Deprecated `script/run` in favor of the `reflect` executable; `script/run` prints a warning and delegates to it.

### Fixed

- Fixed OpenAI requests that came back with an error being treated as success and producing an empty document.

## [0.11.0] - 2025-04-05

### Added

- Added the GitHub URL of each pull request and issue to the contributions document.

## [0.10.1] - 2025-04-03

### Changed

- Changed document generation to print each step as a plain line instead of a progress spinner.

### Removed

- Removed the model-name character restriction that rejected otherwise valid model identifiers.

### Fixed

- Fixed `--brag` failing when `OPENAI_API_KEY` was unset while a non-OpenAI provider was selected; only the selected provider's key is required.
- Fixed environment variables being loaded too late, so values such as `GITHUB_TOKEN` from `.env` are picked up on every run rather than only when `--brag` is passed.

## [0.10.0] - 2025-04-02

### Added

- Added validation of `-p, --provider`, so an unsupported provider fails immediately and the supported providers are listed.
- Added validation of `-m, --model`, rejecting any model name containing characters other than letters, digits, dots, underscores, and hyphens.
- Added validation of the organization names passed to `--include-orgs` and `--exclude-orgs`, reporting every invalid name in a single error.

### Changed

- Changed progress and error output to use one consistent symbol and consistent wording across every step.
- Changed environment loading and each document generation step to report progress with a spinner instead of a plain line.
- Changed a missing `GITHUB_TOKEN` to stop the run with a clear error message instead of a raw execution error.

## [0.9.0] - 2025-04-02

### Added

- Added a statistics section to the contributions document listing the total repositories, pull requests, and issues, followed by the list of repositories contributed to.
- Added those same statistics and the repository list to the summary and brag document templates.

### Changed

- Raised the minimum supported Node.js version to 22.14.0 and the minimum npm version to 10.9.0.
- Changed every dependency to an exact version, so repeated installs resolve identically.

### Fixed

- Fixed contribution fetching stopping at the first 100 search results, by paging through every matching pull request and issue.

## [0.8.0] - 2025-03-31

### Added

- Added Anthropic as an LLM provider, selected with `-p, --provider anthropic`, authenticated with `ANTHROPIC_API_KEY`, and defaulting to the `claude-3-7-sonnet-20250219` model.
- Added `OPENAI_BASE_URL` and `ANTHROPIC_BASE_URL` so requests can be pointed at proxied or self-hosted API endpoints.
- Added README examples for choosing a provider and a model, and listed `ANTHROPIC_API_KEY` alongside `OPENAI_API_KEY` in `.env.example`.

## [0.7.0] - 2025-03-30

### Added

- Added `-m, --model` for choosing which OpenAI model generates the documents, defaulting to `gpt-4o-mini`.

### Changed

- Renamed the `-m, --months` option to `-l, --lookback`, freeing `-m` for the new model option.
- Changed the dates printed in generated documents to follow the system locale instead of always using US formatting.
- Expanded the `--help` examples to use long-form option names and to cover `--exclude-orgs`.

## [0.6.0] - 2025-03-30

### Added

- Added `-i, --include-orgs` and `-e, --exclude-orgs`, each taking one or more organization names, to restrict contributions to, or exclude them from, specific GitHub organizations; passing both at once is rejected with an error.

### Changed

- Changed declining an overwrite to reuse that file's existing contents for the following generation step instead of skipping it.
- Changed the accepted range of `--months` to a maximum of 36.
- Changed the brag document prompt to require a fixed template, with an executive summary, sections for architecture and system design, performance, code quality, technical innovation, and complex problem resolution, and a conclusion.

### Removed

- Removed the end-of-run summary line that printed the fetched pull request and issue counts and the date range.

### Fixed

- Fixed the success message that reported a document as generated when the overwrite prompt had been declined.

## [0.5.0] - 2025-03-30

### Added

- Added `script/setup`, which installs the Node version pinned in `.node-version` along with the npm dependencies, and then checks that `GITHUB_TOKEN` and `OPENAI_API_KEY` are present in `.env`.
- Added `script/bootstrap`, which installs the pinned Node version through nodenv or nvm and installs the npm dependencies.
- Added `script/update`, which brings dependencies up to date before a run.
- Added `script/run`, which updates the project and then runs the CLI with the arguments you pass to it.
- Added `script/console`, which opens an interactive REPL with the GitHub, OpenAI, date, file, and prompt helpers preloaded.

### Changed

- Changed the documented way to install and run the tool to `script/setup` followed by `script/run`, replacing the `npx ts-node` and `npx tsc` invocations.

## [0.4.0] - 2025-03-30

### Added

- Added `DEBUG` environment variable output that prints each GitHub GraphQL query, its response, and the details of any fetch error.
- Added the contribution type, pull request or issue, to each entry in the contributions document.

### Changed

- Changed GitHub data collection from the `gh` CLI to GitHub's GraphQL API through Octokit, which requires a `GITHUB_TOKEN` with `repo` and `read:org` scopes and drops the GitHub CLI prerequisite.
- Changed the title of the contributions document to `# GitHub Activity Report`.
- Changed each run to fetch at most 100 merged pull requests and 100 closed issues.

## [0.3.0] - 2025-03-29

### Added

- Added a `-d, --debug` flag that prints the prompt, completion, and total token counts, the model, and the finish reason for each OpenAI request.
- Added a confirmation prompt before overwriting an existing file in `output/`.
- Added the source repository to each contribution in the generated document.

### Changed

- Changed the summary output file to `output/summarized_contributions.md`.
- Changed the issues in the contributions document to closed issues only.
- Changed each document generation step to print a plain progress line instead of a spinner.
- Changed a failed GitHub fetch to stop with a reported error, including a rate-limit message with the reset time, instead of silently continuing with no results.

### Removed

- Removed the `-k, --api-key` flag, leaving `OPENAI_API_KEY` as the only way to supply the OpenAI key.

### Fixed

- Fixed singular and plural wording in the fetch progress messages.

### Security

- Restricted generated documents to a fixed allowlist of filenames under `output/`, rejecting anything else, so a path-traversal filename cannot be written.

## [0.2.0] - 2025-03-29

### Added

- Added colorized terminal output and progress spinners for fetching pull requests and issues, for the OpenAI request, and for each document generation step.

### Changed

- Changed argument parsing from positional arguments to named options: `-u, --username` and `-m, --months` required, `-b, --brag` and `-k, --api-key` optional, missing or unrecognized arguments rejected, and `--help` and `--version` output generated automatically.

## [0.1.0] - 2025-03-29

### Added

- Added the initial Reflect command-line tool, run with `npx ts-node index.ts`, which fetches your merged pull requests and issues from GitHub through the authenticated `gh` CLI and writes them to a chronological markdown document at `output/contributions.md`.
- Added positional `<github-username>` and `<months-to-look-back>` arguments so any GitHub user and lookback window can be reported on.
- Added an optional `--brag` flag that sends the collected contributions to OpenAI and writes a technical summary to `output/summarized.md` and a brag document to `output/brag_document.md`.
- Added an `--api-key` flag for the OpenAI key, falling back to `OPENAI_API_KEY` from the environment or a `.env` file.
- Added the absolute date range covered to the generated brag document.
- Added a README quickstart covering prerequisites, environment setup, and usage.

[Unreleased]: https://github.com/bostonaholic/reflect/compare/v0.22.2...HEAD
[0.22.2]: https://github.com/bostonaholic/reflect/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/bostonaholic/reflect/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/bostonaholic/reflect/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/bostonaholic/reflect/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/bostonaholic/reflect/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/bostonaholic/reflect/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/bostonaholic/reflect/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/bostonaholic/reflect/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/bostonaholic/reflect/compare/v0.15.3...v0.16.0
[0.15.3]: https://github.com/bostonaholic/reflect/compare/v0.15.2...v0.15.3
[0.15.2]: https://github.com/bostonaholic/reflect/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/bostonaholic/reflect/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/bostonaholic/reflect/compare/v0.14.1...v0.15.0
[0.14.1]: https://github.com/bostonaholic/reflect/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/bostonaholic/reflect/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/bostonaholic/reflect/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/bostonaholic/reflect/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/bostonaholic/reflect/compare/v0.10.1...v0.11.0
[0.10.1]: https://github.com/bostonaholic/reflect/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/bostonaholic/reflect/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/bostonaholic/reflect/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/bostonaholic/reflect/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/bostonaholic/reflect/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/bostonaholic/reflect/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/bostonaholic/reflect/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/bostonaholic/reflect/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/bostonaholic/reflect/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/bostonaholic/reflect/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bostonaholic/reflect/releases/tag/v0.1.0
