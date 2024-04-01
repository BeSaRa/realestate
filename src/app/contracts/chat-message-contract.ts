export enum ChatResponseFormat {
  TABLE = 'TABLE',
  CHART = 'CHART',
  OTHER = 'OTHER',
  ERROR = 'ERROR',
  INVALID = 'INVALID',
}
export interface ChatResponseContract {
  responseFormat: ChatResponseFormat;
  response: Record<string, number | string>[];
}
