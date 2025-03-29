# Reflect

A Node.js tool that generates a reflection document of your GitHub activity by collecting and formatting merged pull requests and closed issues.

## Features

- Fetches merged pull requests and closed issues from GitHub
- Filters by author and date range (last 6 months by default)
- Generates a clean, chronological markdown document
- Combines both PRs and issues into a single reflection document
- Uses GitHub CLI for efficient data retrieval

## Prerequisites

- Node.js v22 or higher
- GitHub CLI (`gh`) installed and authenticated
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/bostonaholic/reflect.git
cd reflect
```

2. Install dependencies:

```bash
npm install
```

## Usage

You can run the script in one of two ways:

### Development Mode

Run directly with ts-node:

```bash
npx ts-node index.ts <github-username> <months-to-look-back>
```

Example:

```bash
npx ts-node index.ts bostonaholic 6
```

### Production Mode

Compile and run:

```bash
npx tsc --outDir dist && node dist/index.js <github-username> <months-to-look-back>
```

Example:

```bash
npx tsc --outDir dist && node dist/index.js bostonaholic 6
```

### Arguments

- `github-username`: Your GitHub username to fetch activity for
- `months-to-look-back`: Number of months to look back for activity (must be a positive number)

## Output

The script will generate a file called `merged_prs_and_issues.md` in the current directory. This file will contain:

- A chronological list of your merged pull requests and closed issues
- Each item includes:
  - Title
  - Closing date
  - Description/body
- Items are sorted by closing date (most recent first)
- Activity for the specified time period

Note: The generated `merged_prs_and_issues.md` file is automatically git-ignored to prevent accidental commits.

## Troubleshooting

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
