import { BaseChatService } from '@abstracts/base-chat.service';
import { inject, Injectable } from '@angular/core';
import { AuthorityChatMessageResultContract, AuthorityMessage } from '@models/authority-message';
import { formatString, formatText } from '@utils/utils';
import { catchError, map, of, tap } from 'rxjs';
import { StreamService } from './stream.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorityChatService extends BaseChatService<AuthorityMessage> {
  private readonly _streamService = inject(StreamService);

  protected override _sendMessage() {
    const url = `${this._configService.CONFIG.AUTHORITY_AI.BASE_URL}/chatbot/chat/website`;
    return this._http
      .post<AuthorityChatMessageResultContract>(url, {
        messages: this.messages(),
        ...(this._streamService.streamId() ? { stream_id: this._streamService.streamId() } : null),
        ...(this._conversationId ? { conversation_id: this._conversationId } : null),
      })
      .pipe(
        tap((res) => (this._conversationId = res.message.conversation_id)),
        map((res) => res.message)
      )
      .pipe(
        catchError((err) => {
          return of(
            new AuthorityMessage().clone<AuthorityMessage>({
              content: err.message,
              role: 'error',
            })
          );
        })
      );
  }

  override _prepareUserMessage(message: string) {
    return new AuthorityMessage(message, 'user');
  }

  protected override _prepareAssistantMessage(message: AuthorityMessage) {
    message.content = formatString(formatText(message.content, message));
    message = new AuthorityMessage().clone(message);
    return message;
  }
}
