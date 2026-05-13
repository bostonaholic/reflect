# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Bumped the Anthropic provider's default model from `claude-sonnet-4-6` to `claude-opus-4-7`.
- Bumped the OpenAI provider's default model from `gpt-4.1` to `gpt-5.5`.

### Removed

- Removed the hardcoded `temperature: 0.7` parameter from OpenAI requests; GPT-5-series models reject the parameter, and the API default is sufficient.
