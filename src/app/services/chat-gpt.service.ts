import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatResponseContract, ChatResponseFormat } from '@contracts/chat-message-contract';
import { catchError, map, Observable, of, timeout } from 'rxjs';
import { TranslationService } from './translation.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class ChatGptService {
  http = inject(HttpClient);
  lang = inject(TranslationService);
  urlService = inject(UrlService);

  ask(message: string): Observable<ChatResponseContract> {
    return this.http
      .post<ChatResponseContract>(this.urlService.URLS.CHAT_BOT, {
        lang: this.lang.isLtr ? 2 : 1,
        question: message,
      })
      .pipe(
        timeout(5000),
        map((res) => {
          if (!res.response.length) {
            res.responseFormat = ChatResponseFormat.INVALID;
          }
          return res;
        }),
        catchError((err) => {
          return of({ responseFormat: ChatResponseFormat.ERROR, response: [] });
        })
      );
  }
}
