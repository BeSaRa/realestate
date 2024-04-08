export enum ChatResponseFormat {
  TABLE = 'TABLE',
  CHART = 'CHART',
  LAW = 'LAW',
  OTHER = 'OTHER',
  ERROR = 'ERROR',
  INVALID = 'INVALID',
}
export interface ChatResponseContract {
  responseFormat: ChatResponseFormat;
  response: Record<string, number | string>[];
}
