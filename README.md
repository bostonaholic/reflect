# Reflect

A Node.js tool that generates a reflection document of your GitHub activity by collecting and formatting merged pull requests and closed issues.

## Quickstart 🚀

### Prerequisites ⚙️

1. Install Node.js v22 or higher
2. Install and authenticate GitHub CLI (`gh`)
3. Install npm or yarn package manager
4. OpenAI API key (optional, for summary and brag document generation)

### Usage 💻

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
# Create a .env file with your OpenAI API key
cp .env{.example,}
```

3. Run the tool:
```bash
npx ts-node index.ts --username <github-username> --months <months-to-look-back> --brag
```

This will generate three markdown files in the `output` directory:
- A detailed list of your GitHub contributions
- A summarized version of your contributions
- A professional brag document highlighting your achievements

## Features ✨

- 📥 Fetches merged pull requests and closed issues from GitHub
- 🔍 Filters by author and date range (last 6 months by default)
- 📝 Generates a clean, chronological markdown document
- 🔄 Combines both PRs and issues into a single reflection document
- ⚡ Uses GitHub CLI for efficient data retrieval
- 🤖 Optional AI-powered summary and brag document generation
- 🔒 Secure handling of API keys and sensitive data

## Usage 🛠️

You can run the script in one of two ways:

### Development Mode 🔧

Run directly with ts-node:

```bash
npx ts-node index.ts --username <github-username> --months <months-to-look-back> [--brag]
```

Example:

```bash
npx ts-node index.ts --username bostonaholic --months 6 --brag
```

### Production Mode 🚀

Compile and run:

```bash
npx tsc --outDir dist && node dist/index.js --username <github-username> --months <months-to-look-back> [--brag]
```

Example:

```bash
npx tsc --outDir dist && node dist/index.js --username bostonaholic --months 6 --brag
```

### Arguments 📋

- `-u, --username <username>`: Your GitHub username to fetch activity for
- `-m, --months <number>`: Number of months to look back for activity (must be a positive number)
- `-b, --brag`: Optional flag to generate a summary and brag document

### Environment Variables 🔐

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key (required only when using the --brag flag)

Set these in your `.env` file:
```
OPENAI_API_KEY=sk-...
```

## Security Considerations 🔒

- API keys are only accepted through environment variables, not command-line arguments
- All file operations are sanitized to prevent path traversal attacks
- GitHub API rate limits are properly handled with informative error messages
- Input validation is performed on all user-provided parameters
- Output files are restricted to a predefined list of allowed filenames

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

### output/summarized.md (with --brag flag) 📝
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

1. Make sure your GitHub CLI (`gh`) is authenticated:

```bash
gh auth status
```

If not authenticated, run:

```bash
gh auth login
```

2. If you get TypeScript errors, ensure you're using Node.js v22 or higher:

```bash
node --version
```

3. If the script runs but generates an empty file, check your GitHub CLI permissions and ensure you have activity in the specified time period.

4. If you get an error about the OpenAI API key:
   - Make sure you've set it in your `.env` file
   - Check that the API key is valid and has sufficient credits
   - Verify the .env file is in the correct location
