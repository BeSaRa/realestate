import { BaseChatService } from '@abstracts/base-chat.service';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BotMap } from '@constants/bot-map';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { BotType } from '@enums/bot-type';
import { BehaviorSubject, finalize, Subject } from 'rxjs';
import { TranslationService } from './translation.service';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class BotService {
  http = inject(HttpClient);
  lang = inject(TranslationService);
  urlService = inject(UrlService);

  private _chatServiceMap = Object.keys(BotMap).reduce((acc, cur) => {
    acc[cur as BotType] = inject(BotMap[cur as BotType].chatServiceType);
    return acc;
  }, {} as Record<BotType, BaseChatService>);

  botTypes: { type: BotType; langKey: keyof LangKeysContract }[] = Object.keys(BotMap).map((b) => ({
    type: b as BotType,
    langKey: BotMap[b as BotType].langKey,
  }));

  private _currentBot = signal<BotType>(BotType.QREP);
  currentBot = computed(() => this._currentBot());
  chatService = computed(() => this._chatServiceMap[this._currentBot()]);

  private _isOpened = signal(false);
  isOpened = computed(() => this._isOpened());
  isLoading = signal(false);

  private _isWritingFromExternalSource = new BehaviorSubject(false);
  isWritingFromExternalSource$ = this._isWritingFromExternalSource.asObservable();

  private _externalSourceUserMessage = new BehaviorSubject('');
  externalSourceUserMessage$ = this._externalSourceUserMessage.asObservable();

  private _messageWritingDone = new Subject<void>();
  messageWritingDone$ = this._messageWritingDone.asObservable();

  private _messageSent = new Subject<void>();
  messageSent$ = this._messageSent.asObservable();

  getCurrentBotConfig() {
    return BotMap[this._currentBot()];
  }

  setCurrentBot(bot: BotType) {
    this._currentBot.set(bot);
  }

  toggleBot() {
    this._isOpened.set(!this._isOpened());
  }

  closeBot() {
    this._isOpened.set(false);
  }

  notifyMessageWritingDone() {
    this._messageWritingDone.next();
  }

  hasMessages() {
    return !!this.chatService().messages().length;
  }

  deleteChat() {
    this.chatService().deleteChat();
  }

  sendMessage(message: string) {
    this.isLoading.set(true);
    this.notifyMessageWritingDone();
    this._messageSent.next();
    return this.chatService()
      .sendMessage(message)
      .pipe(
        finalize(() => {
          this.notifyMessageWritingDone();
          this.isLoading.set(false);
        })
      );
  }

  enableExternalSourceMessageWriting() {
    this._isWritingFromExternalSource.next(true);
  }

  disableExternalSourceMessageWriting() {
    this._isWritingFromExternalSource.next(false);
  }

  writeUserMessageFromExternalSource(text: string) {
    this._externalSourceUserMessage.next(text);
  }
}
