export type NoulQuestion = {
  type: 'noul';
  instructions: string;
};

export type ChoiceQuestion<Choice extends string = string> = {
  type: 'choice';
  instructions: string;
  criteria: Record<Choice, string>;
};

export type ScoreQuestion = {
  type: 'score';
  instructions: string;
  min: number;
  max: number;
  legend?: Record<string, string>;
};

export type WekaQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion;
export type WekaQuestions = Record<string, WekaQuestion>;

export type NoulAnswer = {
  type: 'noul';
  noul: number;
};

export type ChoiceAnswer<Choice extends string = string> = {
  type: 'choice';
  choice: Choice;
  confidence: number;
  probabilities: Record<Choice, number>;
};

export type ScoreAnswer = {
  type: 'score';
  score: number;
  probabilities?: Record<string, number>;
};

export type AnswerFor<Question extends WekaQuestion> =
  Question extends NoulQuestion ? NoulAnswer
    : Question extends ChoiceQuestion<infer Choice> ? ChoiceAnswer<Choice>
      : Question extends ScoreQuestion ? ScoreAnswer
        : never;

export type WekaResponse<Questions extends WekaQuestions> = {
  model: string;
  answers: { [Key in keyof Questions]: AnswerFor<Questions[Key]> };
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

export type WekaRequest<State, Questions extends WekaQuestions> = {
  model: 'weka';
  state: State;
  questions: Questions;
};

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type DecideOptions = {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: FetchLike;
};

export class WekaRequestError extends Error {
  readonly status: number;
  readonly requestId: string | undefined;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = 'WekaRequestError';
    this.status = status;
    this.requestId = requestId;
  }
}

function requiredApiKey(explicitApiKey?: string): string {
  const apiKey = explicitApiKey ?? process.env.AUTOHAND_API_KEY;
  if (!apiKey) {
    throw new Error('Set AUTOHAND_API_KEY before running this example.');
  }
  return apiKey;
}

export async function decide<State, Questions extends WekaQuestions>(
  request: WekaRequest<State, Questions>,
  options: DecideOptions = {},
): Promise<WekaResponse<Questions>> {
  const fetcher: FetchLike = options.fetch ?? globalThis.fetch;
  const baseUrl = (options.baseUrl ?? process.env.AUTOHAND_API_URL ?? 'https://api.autohand.ai')
    .replace(/\/$/, '');
  const timeoutMs = options.timeoutMs ?? 15_000;
  const response = await fetcher(`${baseUrl}/v1/decisions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requiredApiKey(options.apiKey)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const requestId = response.headers.get('x-request-id') ?? undefined;
  if (!response.ok) {
    throw new WekaRequestError(
      `Weka request failed with HTTP ${response.status}${requestId ? ` (${requestId})` : ''}.`,
      response.status,
      requestId,
    );
  }

  const payload: unknown = await response.json();
  if (!isWekaResponse(payload)) {
    throw new WekaRequestError('Weka returned an unexpected response shape.', response.status, requestId);
  }

  return payload as WekaResponse<Questions>;
}

function isWekaResponse(value: unknown): value is WekaResponse<WekaQuestions> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.model === 'string'
    && Boolean(candidate.answers)
    && typeof candidate.answers === 'object'
    && !Array.isArray(candidate.answers);
}
