import { ClonerMixin } from '@mixins/cloner-mixin';
import { AuthorityBaseMessage, AuthorityMessageRoleType } from './authority-base-message';
import { ToolCallContract } from '@contracts/tool-call-contract';

export class AuthorityMessage extends ClonerMixin(AuthorityBaseMessage) {
  end_turn!: boolean;
  function_call!: unknown;
  tool_calls?: ToolCallContract[];
  animationDone = false;

  constructor(public override content = '', public override role: AuthorityMessageRoleType = 'user') {
    super();
  }

  freezeAnimation() {
    this.animationDone = true;
  }
}

export interface AuthorityChatMessageResultContract {
  finish_reason: 'stop';
  index: number;
  logprobs: unknown;
  message: AuthorityMessage;
  error: boolean;
}
