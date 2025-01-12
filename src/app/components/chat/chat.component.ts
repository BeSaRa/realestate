import { AnimationEvent } from '@angular/animations';
import { CommonModule, DOCUMENT, NgComponentOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OpenCloseAnimation } from '@animations/open-close.animation';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { OnlyCurrentLangLettersDirective } from '@directives/only-current-lang-letters.directive';
import { OptionTemplateDirective } from '@directives/option-template.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { BotService } from '@services/bot.service';
import { TranslationService } from '@services/translation.service';
import { combineLatest, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ReactiveFormsModule,
    OnlyCurrentLangLettersDirective,
    SelectInputComponent,
    OptionTemplateDirective,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgComponentOutlet,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [OpenCloseAnimation],
})
export class ChatComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('messagesContainer', { static: true }) messagesContainer!: ElementRef;
  @ViewChild('messageBox', { static: true }) messageBox!: ElementRef;

  botService = inject(BotService);
  lang = inject(TranslationService);
  documnet = inject(DOCUMENT);

  isOpened = computed(() => this.botService.isOpened());
  isTyping = computed(() => this.botService.isLoading());
  isHidden = false;
  isFullScreen = false;

  botType = new FormControl(this.botService.currentBot());

  message = new FormControl('', {
    validators: Validators.required,
    nonNullable: true,
  });

  ngOnInit(): void {
    this._listenToMessageChanged();
    this._listenToLangChange();
    this._listenToBotTypeChange();
    this._listenMessageWritingDone();
    this._listenToMessageWriteFromExternalSource();
  }

  isMessageValid() {
    return !!this.message.value.trim();
  }

  getCurrentBotConfig() {
    return this.botService.getCurrentBotConfig();
  }

  toggleChat() {
    this.botService.toggleBot();

    if (this.isOpened()) {
      this._focusMessageBox();
    }
    this._togglePageScroll();
  }

  closeChat(): void {
    this.botService.closeBot();
    this._togglePageScroll();
  }

  deleteChat() {
    this.botService.deleteChat();
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this._togglePageScroll();
    setTimeout(() => {
      this._adjustMessageBoxHeight();
    }, 150);
  }

  start() {
    this.isHidden = false;
  }

  done($event: AnimationEvent) {
    this.isHidden = $event.toState === 'close';
  }

  sendMessage() {
    if (!this.isMessageValid() || this.isTyping()) {
      return;
    }
    const _message = this.message.value;
    this.message.setValue('');
    this.botService.sendMessage(_message).subscribe();
  }

  private _togglePageScroll() {
    this.isFullScreen && this.documnet.body.classList.add('overflow-hidden');
    !this.isFullScreen && this.documnet.body.classList.remove('overflow-hidden');

    !this.isOpened() && this.documnet.body.classList.remove('overflow-hidden');
  }

  private _focusMessageBox() {
    setTimeout(() => {
      this.messageBox.nativeElement.focus();
    }, 0);
  }

  private _scrollToLastMessage() {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scroll({
        top: (this.messagesContainer.nativeElement as HTMLDivElement).scrollHeight,
        behavior: 'smooth',
      });
    }, 0);
  }

  private _listenToMessageChanged() {
    this.message.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._adjustMessageBoxHeight();
    });
  }

  private _listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.message.setValue('');
    });
  }

  private _listenToBotTypeChange() {
    this.botType.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((bot) => {
      this.botService.setCurrentBot(bot!);
      this._scrollToLastMessage();
      this.message.setValue('');
      this._focusMessageBox();
    });
  }

  private _listenMessageWritingDone() {
    this.botService.messageWritingDone$.pipe(takeUntil(this.destroy$)).subscribe(() => this._scrollToLastMessage());
  }

  private _listenToMessageWriteFromExternalSource() {
    combineLatest([this.botService.isWritingFromExternalSource$, this.botService.externalSourceUserMessage$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isWriting, message]) => {
        if (isWriting) {
          this.message.disable();
          this.message.setValue(message);
        } else {
          this.message.enable();
        }
      });
  }

  private _adjustMessageBoxHeight() {
    this.messageBox.nativeElement.style.height = 'auto';
    this.messageBox.nativeElement.style.height =
      Math.max(32, Math.min(this.messageBox.nativeElement.scrollHeight, 200)) + 'px';
  }
}
