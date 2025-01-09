import { BaseChatService } from '@abstracts/base-chat.service';
import { DatePipe } from '@angular/common';
import { computed, Directive, inject, Signal } from '@angular/core';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { BotService } from '@services/bot.service';
import { TranslationService } from '@services/translation.service';

@Directive({})
export abstract class BaseChatMessagesContainerDirective<
  T = {},
  S extends BaseChatService = BaseChatService
> extends OnDestroyMixin(class {}) {
  lang = inject(TranslationService);
  botService = inject(BotService);
  datePipe = inject(DatePipe);
  chatService = computed(() => this.botService.chatService() as S);

  messages = computed(() => this.botService.chatService().messages()) as Signal<T[]>;

  isTyping = computed(() => this.botService.isLoading());

  startChatDate = computed(() => {
    if (this.botService.isOpened()) {
      if (!this.chatService().startChatDate) {
        this.chatService().updateStartChatDate();
      }
      return this.chatService().startChatDate;
    }
    return null;
  });

  lastMessageDate = computed(() => {
    if (this.botService.isOpened()) {
      if (!this.chatService().lastMessageDate()) {
        return this.chatService().startChatDate;
      }
      return this.chatService().lastMessageDate();
    }
    return null;
  });

  abstract isMe(message: T): boolean;

  isBoot(message: T) {
    return !this.isMe(message);
  }

  abstract getUserMessage(message: T): string;

  isLastMessageFromBot() {
    if (!this.messages.length) return true;
    return this.isBoot(this.messages()[this.messages().length - 1]);
  }

  getPassedTime(date: Date) {
    const now = new Date(Date.now());
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff === 0) return this.lang.map.now;

    if (this.lang.isLtr) {
      if (diff < 60) return diff.toFixed(0) + ' min ago';
      if (diff < 60 * 24) return Math.floor(diff / 60).toFixed(0) + ' hour ago';
    } else {
      if (diff < 60) {
        if (diff === 1) return 'منذ دقيقة';
        if (diff === 2) return 'منذ دقيقتين';
        return 'منذ ' + diff.toFixed(0) + ' ' + (diff <= 10 ? 'دقائق' : 'دقيقة');
      }
      if (diff < 60 * 24) {
        if (diff < 120) return 'منذ ساعة';
        if (diff < 180) return 'منذ ساعتين';
        return 'منذ ' + Math.floor(diff / 60).toFixed(0) + ' ' + (diff <= 10 ? 'ساعات' : 'ساعة');
      }
    }

    return this.datePipe.transform(date, 'EEEE, d MMM, h:mm a', undefined, this.lang.getCurrent().code) ?? '';
  }
}
