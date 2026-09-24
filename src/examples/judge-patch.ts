import { decide } from '../weka.js';

const questions = {
  review_lane: {
    type: 'choice',
    instructions: 'Choose the required review lane for this generated patch.',
    criteria: {
      accept: 'The patch matches the task and the evidence supports merge readiness.',
      revise: 'The patch is directionally correct but needs another implementation pass.',
      security_review: 'Security-sensitive behavior needs a specialist review.',
      human_review: 'The evidence is incomplete, conflicting, or too risky to automate.',
    },
  },
  regression_risk: {
    type: 'score',
    instructions: 'Score regression risk from 0 for negligible to 100 for severe.',
    min: 0,
    max: 100,
    legend: {
      '0': 'Negligible',
      '50': 'Material',
      '100': 'Severe',
    },
  },
} as const;

const result = await decide({
  model: 'weka',
  state: {
    task: 'Reject return URLs outside trusted Autohand origins.',
    diffSummary: 'Adds URL parsing and an origin allowlist before OAuth redirects.',
    tests: ['trusted production origin passes', 'unknown origin falls back', 'relative path passes'],
    sensitiveAreas: ['authentication', 'redirects'],
    unresolvedComments: 0,
  },
  questions,
});

console.log(JSON.stringify(result.answers, null, 2));
