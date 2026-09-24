import { requireConfidence } from '../policy.js';
import { decide } from '../weka.js';

const questions = {
  next_action: {
    type: 'choice',
    instructions: 'Route this failed CI job to the next useful action.',
    criteria: {
      retry: 'Evidence matches a known transient or infrastructure failure.',
      code_owner: 'The changed application code is the most likely cause.',
      platform_owner: 'The runner, network, cache, or build image is the likely cause.',
      needs_investigation: 'The evidence is insufficient or contradictory.',
    },
  },
} as const;

const result = await decide({
  model: 'weka',
  state: {
    command: 'bun test src/checkout',
    exitCode: 1,
    errorSignature: 'ECONNRESET while starting local dependency',
    changedFiles: ['src/checkout/price.ts', 'test/checkout/price.test.ts'],
    retryHistory: [{ attempt: 1, outcome: 'failed', sameSignature: true }],
  },
  questions,
});

const action = requireConfidence(result.answers.next_action, 0.72);
console.log(JSON.stringify({ action, modelAnswer: result.answers.next_action }, null, 2));
