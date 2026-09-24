import type { ChoiceAnswer, NoulAnswer, ScoreAnswer } from './weka.js';

export function requireConfidence<Choice extends string>(
  answer: ChoiceAnswer<Choice>,
  minimum: number,
): Choice | 'human_review' {
  return answer.confidence >= minimum ? answer.choice : 'human_review';
}

export function exceedsProbability(answer: NoulAnswer, threshold: number): boolean {
  return answer.noul >= threshold;
}

export function scoreAtLeast(answer: ScoreAnswer, threshold: number): boolean {
  return answer.score >= threshold;
}
