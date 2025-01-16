import { BaseChatService } from '@abstracts/base-chat.service';
import { Injectable } from '@angular/core';
import { QrepChatResponseContract, QrepChatResponseFormat } from '@contracts/qrep-chat-message-contract';
import { catchError, map, of, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QrepChatService extends BaseChatService<QrepChatResponseContract> {
  protected override _sendMessage(message: string) {
    return this._http
      .post<QrepChatResponseContract>(this._urlService.URLS.CHAT_BOT, {
        lang: this._lang.isLtr ? 2 : 1,
        question: message,
      })
      .pipe(
        timeout(5000),
        map((res) => {
          if (!res.response.length) {
            res.responseFormat = QrepChatResponseFormat.INVALID;
          }
          return res;
        }),
        catchError(() => {
          return of({ responseFormat: QrepChatResponseFormat.ERROR, response: [] });
        })
      );
  }

  override _prepareUserMessage(message: string | QrepChatResponseContract) {
    return message;
  }

  protected override _prepareAssistantMessage(message: QrepChatResponseContract) {
    return message;
  }

  protected override _onDeleteChat(): void {}
}
