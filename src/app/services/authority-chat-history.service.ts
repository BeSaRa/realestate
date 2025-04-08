import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatFeedback } from '@enums/chat-feedback';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorityChatHistoryService {
  protected _http = inject(HttpClient);
  protected _configService = inject(ConfigService);

  private readonly _chatHistoryUrl = this._configService.CONFIG.AUTHORITY_AI.BASE_URL + '/chat-history';

  addFeedback(conversationId: string, feedback: ChatFeedback) {
    const url = `${this._chatHistoryUrl}/add-conversation-feedback`;
    const params = new HttpParams().set('conv_id', conversationId).set('feedback', feedback);
    return this._http.post<string>(url, null, { params: params });
  }
}
