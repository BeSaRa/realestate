export enum QrepChatResponseFormat {
  TABLE = 'TABLE',
  CHART = 'CHART',
  LAW = 'LAW',
  OTHER = 'OTHER',
  ERROR = 'ERROR',
  INVALID = 'INVALID',
  AVG = 'AVG',
}
export interface QrepChatResponseContract {
  responseFormat: QrepChatResponseFormat;
  response: Record<string, number | string>[];
}
