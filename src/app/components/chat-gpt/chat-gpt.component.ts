import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ChatGptDataViewComponent } from '@components/chat-gpt-data-view/chat-gpt-data-view.component';
import { ChatResponseContract, ChatResponseFormat } from '@contracts/chat-message-contract';
import { OnlyCurrentLangLettersDirective } from '@directives/only-current-lang-letters.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ChatGptService } from '@services/chat-gpt.service';
import { TranslationService } from '@services/translation.service';
import { finalize, take, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-chat-gpt',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    OnlyCurrentLangLettersDirective,
    ChatGptDataViewComponent,
  ],
  providers: [DatePipe],
  templateUrl: './chat-gpt.component.html',
  styleUrls: ['./chat-gpt.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          width: '*',
          height: '*',
          opacity: 1,
        })
      ),
      state(
        'close',
        style({
          width: 0,
          height: 0,
          opacity: 0,
        })
      ),
      transition('* <=> *', animate('150ms ease-in-out')),
    ]),
    trigger('slideMessage', [
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateY(100%)',
        }),
        animate(
          '150ms ease-in-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          })
        ),
      ]),
    ]),
  ],
})
export class ChatGptComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChild('messageBox', { static: true }) messageBox!: ElementRef;

  chatGptService = inject(ChatGptService);
  lang = inject(TranslationService);
  documnet = inject(DOCUMENT);
  datePipe = inject(DatePipe);

  isOpened = false;
  isHidden = false;
  isFullScreen = false;
  isFirstOpen = true;
  isTyping = false;

  messages: (ChatResponseContract | string)[] = [];
  message = new FormControl('', {
    validators: Validators.required,
    nonNullable: true,
  });
  lastMessage = '';

  get isMessageValid() {
    return !!this.message.value.trim();
  }

  startChatDate = new Date(Date.now());
  lastMessageDate = new Date(Date.now());

  readonly responseFormat = ChatResponseFormat;

  ngOnInit(): void {
    this._listenToLangChange();
  }

  toggleChat() {
    this.isOpened = !this.isOpened;

    if (this.isOpened) {
      setTimeout(() => {
        this.messageBox.nativeElement.focus();
      }, 0);

      if (this.isFirstOpen) {
        this.isFirstOpen = false;
        this.startChatDate = new Date(Date.now());
        this.lastMessageDate = new Date(Date.now());
      }
    }
    this._togglePageScroll();
  }

  closeChat(): void {
    this.isOpened = false;
    this._togglePageScroll();
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this._togglePageScroll();
  }

  start() {
    this.isHidden = false;
  }

  done($event: AnimationEvent) {
    this.isHidden = $event.toState === 'close';
  }

  isMe(message: ChatResponseContract | string): message is string {
    return typeof message === 'string';
  }

  isBoot(message: ChatResponseContract | string) {
    return !this.isMe(message);
  }

  getMessage(message: ChatResponseContract | string) {
    return typeof message === 'string' ? message : '';
  }

  sendMessage() {
    if (!this.isMessageValid || this.isTyping) {
      return;
    }

    this.lastMessage = this.message.value;
    this.messages.push(this.lastMessage);

    this._scrollToLastMessage();

    setTimeout(() => {
      this.message.setValue('', { emitEvent: false });
    }, 0);

    this.isTyping = true;
    this.lastMessageDate = new Date(Date.now());

    this.chatGptService
      .ask(this.lastMessage)
      .pipe(
        take(1),
        tap((response) => {
          this.isTyping = false;
          this.messages.push(response);
        }),
        finalize(() => {
          setTimeout(() => {
            this.isTyping = false;
            this._scrollToLastMessage();
            this.lastMessageDate = new Date(Date.now());
          });
        })
      )
      .subscribe(() => {});
  }

  isLastMessageFromBot() {
    if (!this.messages.length) return true;
    return this.isBoot(this.messages[this.messages.length - 1]);
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

  private _togglePageScroll() {
    this.isFullScreen && this.documnet.body.classList.add('overflow-hidden');
    !this.isFullScreen && this.documnet.body.classList.remove('overflow-hidden');

    !this.isOpened && this.documnet.body.classList.remove('overflow-hidden');
  }

  private _scrollToLastMessage() {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scroll({
        top: (this.messagesContainer.nativeElement as HTMLDivElement).scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  }

  private _listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.message.setValue('', { emitEvent: false });
    });
  }
}
