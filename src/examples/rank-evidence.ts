import { decide, type WekaQuestions } from '../weka.js';

const evidence = [
  { id: 'release', kind: 'primary', date: '2026-09-01', excerpt: 'Version 2.4 removes the legacy endpoint.' },
  { id: 'docs', kind: 'primary', date: '2026-08-28', excerpt: 'The legacy endpoint is deprecated.' },
  { id: 'forum', kind: 'community', date: '2026-07-10', excerpt: 'The old endpoint still worked for me.' },
] as const;

const questions = {
  ...Object.fromEntries(evidence.map((item) => [
    `relevance_${item.id}`,
    {
      type: 'score',
      instructions: `Score how directly ${item.id} answers the research question from 0 to 100.`,
      min: 0,
      max: 100,
    },
  ])),
  sufficient_evidence: {
    type: 'noul',
    instructions: 'Is there enough current primary evidence to answer the question?',
  },
} as WekaQuestions;

const result = await decide({
  model: 'weka',
  state: {
    question: 'Is the legacy endpoint available in version 2.4?',
    evidence,
  },
  questions,
});

console.log(JSON.stringify(result.answers, null, 2));
