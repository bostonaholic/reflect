# LLM Prompts Organization

This directory contains the prompt templates and utilities for interacting with LLM APIs.

## Understanding System vs User Prompts

When calling an LLM API, two types of prompts are sent:

1. **System Prompt**: Instructions that tell the LLM how to behave and what format to use
2. **User Prompt**: The actual content/data that the LLM should process

Example:

```typescript
// System prompt (from markdown file)
const systemPrompt = "You are an expert at summarizing technical contributions...";

// User prompt (runtime data)
const userPrompt = "Time Period: Jan 2024 - Jul 2024\n\n## Contributions\n- Fixed bug...";

// Both are sent to the LLM
callLlm(systemPrompt, userPrompt, apiKey, options);
```

## Directory Structure

```text
prompts/
├── system/                      # System prompt templates
│   ├── brag-document.md        # Instructions for generating brag documents
│   └── contributions-summary.md # Instructions for summarizing contributions
├── user-prompt-templates.ts    # Templates for constructing user prompts
└── prompt-utils.ts             # Utilities for loading system prompts
```

## System Prompts

System prompts are stored as markdown files in the `system/` directory. Each file contains:

- Role definition (e.g., "You are an expert at...")
- Formatting rules and requirements
- Expected output structure/template
- Specific instructions for the task

### Available System Prompts

#### brag-document.md

- **Purpose**: Generate professional brag documents from technical summaries
- **User Prompt Expected**: Time period + technical summary
- **Output**: Formatted brag document with specific sections

#### contributions-summary.md

- **Purpose**: Summarize GitHub contributions (PRs and issues)
- **User Prompt Expected**: Raw list of contributions
- **Output**: Organized summary with patterns and impact

## User Prompts

User prompts are generated at runtime and contain the actual data to be processed:

- For brag documents: Time period + previously generated summary
- For contribution summaries: Raw contribution data from GitHub

## Usage Examples

### Loading a System Prompt

```typescript
import { readSystemPrompt } from '../prompts/prompt-utils.js';

const systemPrompt = await readSystemPrompt('brag-document');
```

### Generating User Prompt and Calling LLM

```typescript
import { createBragDocumentUserPrompt, createContributionSummaryUserPrompt } from '../prompts/user-prompt-templates.js';

// Brag Document Generation
const systemPrompt = await readSystemPrompt('brag-document');
const userPrompt = createBragDocumentUserPrompt(summary, startDate, endDate);
const result = await callLlm(systemPrompt, userPrompt, apiKey, llmOptions);

// Contribution Summary Generation
const systemPrompt = await readSystemPrompt('contributions-summary');
const userPrompt = createContributionSummaryUserPrompt(contributionsMarkdown);
const result = await callLlm(systemPrompt, userPrompt, apiKey, llmOptions);
```
