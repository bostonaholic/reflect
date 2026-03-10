import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { callAnthropic } from '../../lib/integrations/llm/anthropic.js';
import { setDebug } from '../../lib/utils/debug-utils.js';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

function buildMockResponse(overrides: Record<string, unknown> = {}) {
  return {
    content: [{ type: 'text', text: 'Test response' }],
    model: 'claude-sonnet-4-6',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      ...overrides,
    },
  };
}

const llmOptions = { provider: 'anthropic' as const, model: 'claude-sonnet-4-6' };

describe('callAnthropic', () => {
  let consoleSpy: MockInstance;

  beforeEach(() => {
    mockCreate.mockReset();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    setDebug(false);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    setDebug(undefined as unknown as boolean);
  });

  describe('cache_control parameter', () => {
    it('includes cache_control with type ephemeral in the API request', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      await callAnthropic('system prompt', 'user prompt', 'test-key', llmOptions);

      const requestArg = mockCreate.mock.calls[0][0];
      expect(requestArg).toHaveProperty('system');

      // The system message should include cache_control
      const systemContent = requestArg.system;
      expect(systemContent).toEqual([
        {
          type: 'text',
          text: 'system prompt',
          cache_control: { type: 'ephemeral' },
        },
      ]);
    });
  });

  describe('debug logging of cache usage', () => {
    it('logs cache_creation_input_tokens and cache_read_input_tokens when DEBUG=1', async () => {
      setDebug(true);
      mockCreate.mockResolvedValue(
        buildMockResponse({
          cache_creation_input_tokens: 100,
          cache_read_input_tokens: 50,
        })
      );

      await callAnthropic('system prompt', 'user prompt', 'test-key', llmOptions);

      const output = consoleSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join('\n');
      expect(output).toContain('100');
      expect(output).toContain('50');
      expect(output).toMatch(/cache.creation/i);
      expect(output).toMatch(/cache.read/i);
    });

    it('logs zero cache values when cache fields are 0', async () => {
      setDebug(true);
      mockCreate.mockResolvedValue(
        buildMockResponse({
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        })
      );

      await callAnthropic('system prompt', 'user prompt', 'test-key', llmOptions);

      const output = consoleSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join('\n');
      expect(output).toMatch(/cache.creation/i);
      expect(output).toMatch(/cache.read/i);
    });

    it('does not log debug output when DEBUG is not set', async () => {
      setDebug(false);
      mockCreate.mockResolvedValue(buildMockResponse());

      await callAnthropic('system prompt', 'user prompt', 'test-key', llmOptions);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  it('returns the text content from the response', async () => {
    mockCreate.mockResolvedValue(buildMockResponse());

    const result = await callAnthropic('system prompt', 'user prompt', 'test-key', llmOptions);

    expect(result).toBe('Test response');
  });
});
