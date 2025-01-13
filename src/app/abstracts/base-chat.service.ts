import { HttpClient } from '@angular/common/http';
import { computed, inject, signal } from '@angular/core';
import { ConfigService } from '@services/config.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { finalize, Observable, tap } from 'rxjs';

export abstract class BaseChatService<T = {}> {
  protected _http = inject(HttpClient);
  protected _urlService = inject(UrlService);
  protected _configService = inject(ConfigService);
  protected _lang = inject(TranslationService);

  protected _messages = signal<(T | string)[]>([]);
  messages = computed(() => this._messages());

  protected _conversationId: string | null = null;

  startChatDate: Date | null = null;
  lastMessageDate = signal<Date | null>(null);

  lastQuestion = '';

  sendMessage(message: string) {
    this.lastQuestion = message;
    this.addMessage(this._prepareUserMessage(message));
    this.updateLastMessageDate();
    return this._sendMessage(message).pipe(
      tap((res) => this.addMessage(this._prepareAssistantMessage(res))),
      finalize(() => this.updateLastMessageDate())
    );
  }

  addMessage(message: string | T) {
    this._messages.update((messages) => {
      messages.push(message);
      return messages;
    });
  }

  clearMessages() {
    this._messages.set([]);
  }

  deleteChat() {
    this.clearMessages();
    this.updateStartChatDate();
    this.updateLastMessageDate();
    this.clearCurrentConversationId();
  }

  updateConversationId(id: string) {
    this._conversationId = id;
  }

  clearCurrentConversationId() {
    this._conversationId = null;
  }

  updateStartChatDate() {
    this.startChatDate = new Date(Date.now());
  }

  updateLastMessageDate() {
    this.lastMessageDate.set(new Date(Date.now()));
  }

  protected abstract _sendMessage(message: string): Observable<T>;
  protected abstract _prepareUserMessage(message: string): string | T;
  protected abstract _prepareAssistantMessage(message: T): T;
}
