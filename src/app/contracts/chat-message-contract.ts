export enum ChatResponseFormat {
  TABLE = 'TABLE',
  CHART = 'CHART',
  LAW = 'LAW',
  OTHER = 'OTHER',
  ERROR = 'ERROR',
  INVALID = 'INVALID',
  AVG = 'AVG',
}
export interface ChatResponseContract {
  responseFormat: ChatResponseFormat;
  response: Record<string, number | string>[];
}
