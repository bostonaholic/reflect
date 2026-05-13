import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { callOpenAI } from '../../lib/integrations/llm/openai.js';
import { setDebug } from '../../lib/utils/debug-utils.js';

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      responses = { create: mockCreate };
    },
  };
});

function buildMockResponse(overrides: Record<string, unknown> = {}) {
  return {
    output_text: 'Test response',
    model: 'gpt-5.5',
    status: 'completed',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30,
      input_tokens_details: { cached_tokens: 0 },
    },
    ...overrides,
  };
}

const llmOptions = { provider: 'openai' as const, model: 'gpt-5.5' };

describe('callOpenAI', () => {
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

  describe('request shape', () => {
    it('sends model, instructions, and input to the OpenAI Responses API', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const requestArg = mockCreate.mock.calls[0][0];
      expect(requestArg).toEqual({
        model: 'gpt-5.5',
        instructions: 'system prompt',
        input: 'user prompt',
      });
    });

    it('does not pass a temperature parameter', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      const requestArg = mockCreate.mock.calls[0][0];
      expect(requestArg).not.toHaveProperty('temperature');
    });

    it('defaults to gpt-5.5 when llmOptions.model is not provided', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      await callOpenAI('system prompt', 'user prompt', 'test-key', {
        provider: 'openai',
      } as never);

      const requestArg = mockCreate.mock.calls[0][0];
      expect(requestArg.model).toBe('gpt-5.5');
    });

    it('uses the model from llmOptions when provided', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      await callOpenAI('system prompt', 'user prompt', 'test-key', {
        provider: 'openai',
        model: 'gpt-5.5-mini',
      });

      const requestArg = mockCreate.mock.calls[0][0];
      expect(requestArg.model).toBe('gpt-5.5-mini');
    });
  });

  describe('response handling', () => {
    it('returns the output_text from the response', async () => {
      mockCreate.mockResolvedValue(buildMockResponse());

      const result = await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      expect(result).toBe('Test response');
    });

    it('returns a fallback string when output_text is empty', async () => {
      mockCreate.mockResolvedValue(buildMockResponse({ output_text: '' }));

      const result = await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      expect(result).toBe('Empty response from OpenAI');
    });

    it('throws when the response contains an error', async () => {
      mockCreate.mockResolvedValue(
        buildMockResponse({ error: { message: 'rate limited' } })
      );

      await expect(
        callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions)
      ).rejects.toThrow('OpenAI API error: rate limited');
    });

    it('throws a generic error when response.error has no message', async () => {
      mockCreate.mockResolvedValue(buildMockResponse({ error: {} }));

      await expect(
        callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions)
      ).rejects.toThrow('OpenAI API error: Unknown error');
    });
  });

  describe('debug logging', () => {
    it('logs token usage and model info when DEBUG=1', async () => {
      setDebug(true);
      mockCreate.mockResolvedValue(
        buildMockResponse({
          usage: {
            input_tokens: 100,
            output_tokens: 200,
            total_tokens: 300,
            input_tokens_details: { cached_tokens: 50 },
          },
        })
      );

      await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      const output = consoleSpy.mock.calls.map((c: unknown[]) => c.join(' ')).join('\n');
      expect(output).toContain('100');
      expect(output).toContain('200');
      expect(output).toContain('300');
      expect(output).toContain('50');
      expect(output).toContain('gpt-5.5');
      expect(output).toMatch(/Input Tokens/i);
      expect(output).toMatch(/Output Tokens/i);
      expect(output).toMatch(/Cached Input Tokens/i);
    });

    it('does not log debug output when DEBUG is not set', async () => {
      setDebug(false);
      mockCreate.mockResolvedValue(buildMockResponse());

      await callOpenAI('system prompt', 'user prompt', 'test-key', llmOptions);

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
