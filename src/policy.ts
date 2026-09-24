import type {
  WekaChoiceAnswer,
  WekaNoulAnswer,
  WekaScoreAnswer,
} from '@autohandai/agent-sdk';

export function requireConfidence<Choice extends string>(
  answer: WekaChoiceAnswer<Choice>,
  minimum: number,
): Choice | 'human_review' {
  return answer.confidence >= minimum ? answer.choice : 'human_review';
}

export function exceedsProbability(answer: WekaNoulAnswer, threshold: number): boolean {
  return answer.noul >= threshold;
}

export function scoreAtLeast(answer: WekaScoreAnswer, threshold: number): boolean {
  return answer.score >= threshold;
}
