# Weka samples

Small, runnable examples for [Weka](https://autohand.ai/models/weka/), Autohand's typed decision model.

Weka accepts structured state plus named questions and returns values that application code can validate: a probability, a named choice, or a score. These examples keep thresholds and final actions in ordinary code, where they can be tested and reviewed.

Weka is in Public Preview. It is available through the Autohand API, Autohand SDK, and [Console Playground](https://console.autohand.ai/playground/).

## Quick start

You need [Bun](https://bun.sh/) and an Autohand API key.

```bash
git clone https://github.com/autohandai/weka-samples.git
cd weka-samples
bun install
cp .env.example .env
```

Put your key in `.env`, then run an example:

```bash
bun run example:release
```

Bun loads `.env` automatically. You can also export `AUTOHAND_API_KEY` in your shell.

## Examples

| Command | Decision |
| --- | --- |
| `bun run example:release` | Route a release to stable, canary, or blocked |
| `bun run example:ci` | Triage a failed CI job |
| `bun run example:patch` | Judge a generated patch and score regression risk |
| `bun run example:tests` | Rank candidate tests for a change |
| `bun run example:data` | Detect semantic drift after schema validation |
| `bun run example:research` | Rank evidence and check whether it is sufficient |
| `bun run example:agent` | Gather repository evidence with the Code Agent SDK, then ask Weka for a release lane |

Every direct example uses `WekaClient` from `@autohandai/agent-sdk` 1.1 or
newer. The SDK validates the complete request and response contract, applies a
timeout, and avoids printing response bodies when a request fails.

## Weka and the Code Agent SDK

[`@autohandai/agent-sdk`](https://github.com/autohandai/code-agent-sdk-typescript)
includes both Autohand Code agents and a direct, typed Weka client.

The agent-assisted example uses `Agent` to inspect a repository and return
structured evidence, then sends that bounded evidence to Weka with
`WekaClient` from the same SDK:

```text
repository -> Code Agent SDK -> structured evidence -> Weka -> application policy
```

Run it against a repository after installing and signing in to Autohand Code:

```bash
AUTOHAND_TARGET_REPO=/path/to/repository bun run example:agent
```

The example starts the Code Agent SDK in restricted mode and tells it not to edit files. Review the target repository before granting any interactive permission.

## Keep policy outside the model

A Weka answer is evidence for your policy, not permission to perform an action. The examples show a few useful safeguards:

- require a minimum confidence before accepting a choice
- preserve mandatory tests and deterministic validators
- fail to human review when evidence is missing or contradictory
- keep destructive actions, credentials, and external side effects behind explicit application checks
- log redacted state, the typed answer, model version, and request ID for audit work

Tune thresholds on representative data before using them in production. Start with a shadow run, compare Weka's answers with current outcomes, then enable one bounded action at a time.

## Build your own example

```typescript
import { WekaClient } from '@autohandai/agent-sdk';

const weka = new WekaClient();

const questions = {
  route: {
    type: 'choice',
    instructions: 'Choose the safest next step.',
    criteria: {
      continue: 'Evidence supports the normal path.',
      review: 'A person must inspect the evidence.',
      stop: 'Policy or safety evidence requires a stop.',
    },
  },
} as const;

const result = await weka.decide({
  model: 'weka',
  state: { testsPassed: true, risk: 'medium' },
  questions,
});

console.log(result.answers.route.choice);
```

Good state is current, compact, redacted, and tied to one decision. Good criteria are mutually exclusive and describe observable outcomes.

## Checks

```bash
bun run check
```

The test suite injects a mocked `fetch` into the SDK client. It does not call
the live API.

## Contributing

New examples are welcome, especially examples with clear policy boundaries, representative fixtures, and a test that runs without network access. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. You can also use the issue templates to propose a workflow or report a bug.

## Links

- [Weka product page](https://autohand.ai/models/weka/)
- [Weka documentation](https://docs.autohand.ai/models/weka/)
- [Autohand Console Playground](https://console.autohand.ai/playground/)
- [Autohand Code Agent SDK for TypeScript](https://github.com/autohandai/code-agent-sdk-typescript)
- [Weka use cases](https://autohand.ai/use-cases/?collection=Weka%20decision%20workflows)

## License

MIT
