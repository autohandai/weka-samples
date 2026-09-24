import { Agent, WekaClient } from '@autohandai/agent-sdk';

type ReleaseEvidence = {
  summary: string;
  changedFiles: string[];
  tests: Array<{ command: string; result: 'passed' | 'failed' | 'not_run' }>;
  sensitiveAreas: string[];
  rollbackReady: boolean;
};

const targetRepo = process.env.AUTOHAND_TARGET_REPO ?? process.cwd();
const agent = await Agent.create({
  cwd: targetRepo,
  instructions: 'Inspect repository evidence only. Do not change files or external state.',
  permissionMode: 'restricted',
});

let evidence: ReleaseEvidence;
try {
  evidence = await agent.runJson<ReleaseEvidence>(
    'Inspect the current diff and test configuration. Return concise release-gate evidence without editing files.',
    {
      schemaName: 'ReleaseEvidence',
      schema: {
        summary: 'string',
        changedFiles: ['string'],
        tests: [{ command: 'string', result: 'passed | failed | not_run' }],
        sensitiveAreas: ['string'],
        rollbackReady: 'boolean',
      },
      validate: (value) => value as ReleaseEvidence,
    },
  );
} finally {
  await agent.close();
}

const questions = {
  release_lane: {
    type: 'choice',
    instructions: 'Choose the safest release lane from repository evidence.',
    criteria: {
      stable: 'Proceed with the standard rollout.',
      canary: 'Use a monitored partial rollout.',
      blocked: 'Stop for missing evidence or unacceptable risk.',
    },
  },
} as const;

const result = await new WekaClient().decide({ model: 'weka', state: evidence, questions });
console.log(JSON.stringify({ evidence, decision: result.answers.release_lane }, null, 2));
