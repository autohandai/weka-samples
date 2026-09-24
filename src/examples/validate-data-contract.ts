import { WekaClient } from '@autohandai/agent-sdk';

import { requireConfidence } from '../policy.js';

const questions = {
  compatibility: {
    type: 'choice',
    instructions: 'Classify semantic compatibility after deterministic schema validation passes.',
    criteria: {
      compatible: 'Meaning, units, and expected distributions remain compatible.',
      review: 'A person should inspect a plausible but uncertain semantic change.',
      quarantine: 'Keep this batch isolated while the producer is checked.',
      reject: 'The change violates the published contract.',
    },
  },
} as const;

const result = await new WekaClient().decide({
  model: 'weka',
  state: {
    contract: { field: 'temperature_c', type: 'number', unit: 'celsius' },
    deterministicValidation: { valid: true },
    observedProfile: { min: 64, median: 72, max: 91, nullRate: 0.001 },
    previousProfile: { min: 17, median: 22, max: 34, nullRate: 0.001 },
    producerChange: 'Sensor firmware update deployed 20 minutes ago.',
  },
  questions,
});

const disposition = requireConfidence(result.answers.compatibility, 0.8);
console.log(JSON.stringify({ disposition, modelAnswer: result.answers.compatibility }, null, 2));
