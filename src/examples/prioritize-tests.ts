import { WekaClient, type WekaQuestions } from '@autohandai/agent-sdk';

const candidates = [
  { id: 'checkout-unit', costSeconds: 18, covers: ['price', 'discount'] },
  { id: 'checkout-contract', costSeconds: 45, covers: ['api-schema', 'price'] },
  { id: 'full-browser', costSeconds: 420, covers: ['checkout-ui', 'payments'] },
] as const;

const questions = Object.fromEntries(candidates.map((test) => [
  `priority_${test.id.replaceAll('-', '_')}`,
  {
    type: 'score',
    instructions: `Score how useful ${test.id} is for this change against the ordered anchors.`,
    criteria: [
      'No useful coverage for this change.',
      'Weak indirect coverage.',
      'Useful supporting coverage.',
      'Strong direct coverage.',
      'Highest-priority coverage for the changed behavior.',
    ],
  },
])) as WekaQuestions;

const result = await new WekaClient().decide({
  model: 'weka',
  state: {
    changedFiles: ['src/checkout/price.ts'],
    changedContracts: ['CheckoutPrice.total'],
    recentFailures: ['checkout-contract'],
    candidates,
  },
  questions,
});

const ranked = Object.entries(result.answers)
  .map(([question, answer]) => ({
    test: question.replace('priority_', '').replaceAll('_', '-'),
    score: answer.type === 'score' ? answer.score : 0,
  }))
  .sort((left, right) => right.score - left.score);

console.table(ranked);
