import { WekaClient } from '@autohandai/agent-sdk';

import { requireConfidence } from '../policy.js';

const questions = {
  release_lane: {
    type: 'choice',
    instructions: 'Choose the safest release lane from the supplied evidence.',
    criteria: {
      stable: 'Proceed with the standard production rollout.',
      canary: 'Deploy to a small cohort and inspect health first.',
      blocked: 'Do not deploy until a person resolves the evidence.',
    },
  },
} as const;

const result = await new WekaClient().decide({
  model: 'weka',
  state: {
    tests: { passed: 842, failed: 0, flaky: 2 },
    changedFiles: 14,
    touchesPayments: true,
    openIncidents: 0,
    rollbackReady: true,
  },
  questions,
});

const lane = requireConfidence(result.answers.release_lane, 0.75);
console.log(JSON.stringify({ lane, modelAnswer: result.answers.release_lane }, null, 2));

if (lane === 'blocked' || lane === 'human_review') process.exitCode = 2;
