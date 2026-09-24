# Contributing

Thanks for helping make Weka examples easier to use.

## Before opening a pull request

1. Keep the example focused on one decision.
2. Use synthetic, redacted fixtures. Do not commit API keys, production logs, or customer data.
3. Keep the final policy in code. Low-confidence or incomplete evidence should route to review.
4. Add or update a network-free test when you change the shared client.
5. Run `bun run check`.

## Proposing an example

Open an example proposal and include:

- the state Weka receives
- the exact question type and criteria
- the deterministic checks that run before or after Weka
- the safe fallback for low confidence or request failure
- how a maintainer can verify the example without production access

Small pull requests are easiest to review. A maintainer may ask to split a broad workflow into separate examples.
