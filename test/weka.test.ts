import { describe, expect, test } from 'bun:test';
import { decide, WekaRequestError } from '../src/weka.js';

describe('decide', () => {
  test('returns a typed choice answer', async () => {
    const questions = {
      route: {
        type: 'choice',
        instructions: 'Choose a route.',
        criteria: { continue: 'Continue.', review: 'Review.' },
      },
    } as const;
    let capturedAuthorization = '';

    const result = await decide(
      { model: 'weka', state: { risk: 'medium' }, questions },
      {
        apiKey: 'test-key',
        baseUrl: 'https://example.test',
        fetch: async (_input, init) => {
          capturedAuthorization = new Headers(init?.headers).get('authorization') ?? '';
          return new Response(JSON.stringify({
            model: 'weka',
            answers: {
              route: {
                type: 'choice',
                choice: 'review',
                confidence: 0.82,
                probabilities: { continue: 0.18, review: 0.82 },
              },
            },
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        },
      },
    );

    expect(capturedAuthorization).toBe('Bearer test-key');
    expect(result.answers.route.choice).toBe('review');
  });

  test('reports status and request ID without echoing the response body', async () => {
    const fetcher = async () => new Response(
      JSON.stringify({ secret: 'must-not-appear' }),
      { status: 429, headers: { 'x-request-id': 'req-test' } },
    );

    try {
      await decide(
        {
          model: 'weka',
          state: {},
          questions: { stop: { type: 'noul', instructions: 'Stop?' } },
        },
        { apiKey: 'test-key', fetch: fetcher },
      );
      throw new Error('Expected decide to fail.');
    } catch (error) {
      expect(error).toBeInstanceOf(WekaRequestError);
      expect((error as WekaRequestError).status).toBe(429);
      expect((error as WekaRequestError).requestId).toBe('req-test');
      expect((error as Error).message).not.toContain('must-not-appear');
    }
  });

  test('rejects an unexpected response shape', async () => {
    await expect(decide(
      {
        model: 'weka',
        state: {},
        questions: { stop: { type: 'noul', instructions: 'Stop?' } },
      },
      {
        apiKey: 'test-key',
        fetch: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      },
    )).rejects.toThrow('unexpected response shape');
  });
});
