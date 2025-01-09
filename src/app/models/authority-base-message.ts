import { generateUUID } from '@utils/utils';

export class AuthorityBaseMessage {
  context!: IContext;
  conversation_id!: string;
  content!: string;
  role!: AuthorityMessageRoleType;
  id?: string;

  /**
   *
   */
  constructor() {
    this.id = generateUUID();
  }
  isUser(): boolean {
    return this.role === 'user';
  }

  isAssistant(): boolean {
    return this.role === 'assistant';
  }

  isError(): boolean {
    return this.role === 'error';
  }
}

export type AuthorityMessageRoleType = 'assistant' | 'user' | 'system' | 'error' | 'tool' | 'function';

interface IContext {
  citations: CitationsContract[];
  intent: string[];
}

export interface CitationsContract {
  title: string;
  filepath: string;
  content: string;
  url: string;
}
