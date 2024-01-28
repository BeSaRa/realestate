import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { ChatGptService } from '@services/chat-gpt.service';
import { MessageContract } from '@contracts/message-contract';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-gpt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ReactiveFormsModule],
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
export class ChatGptComponent {
  isOpened: 'close' | 'open' = 'close';
  isHidden = false;
  isFullScreen = false;
  chatGptService = inject(ChatGptService);
  messages: (MessageContract | string)[] = [];
  isTyping = false;
  message = new FormControl('', {
    validators: Validators.required,
    nonNullable: true,
  });
  @ViewChild('messagesContainer', { static: true })
  container!: ElementRef;

  toggleChat() {
    this.isOpened = this.isOpened === 'close' ? 'open' : 'close';
  }

  closeChat(): void {
    this.isOpened = 'close';
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
  }

  start() {
    this.isHidden = false;
  }

  done($event: AnimationEvent) {
    this.isHidden = $event.toState === 'close';
  }

  isMe(message: MessageContract | string) {
    return typeof message === 'string';
  }

  isBoot(message: MessageContract | string) {
    return !this.isMe(message);
  }

  getMessage(message: MessageContract | string) {
    return typeof message === 'string' ? message : message.text;
  }

  sendMessage() {
    if (this.message.invalid) {
      return;
    }
    const message = this.message.value;
    this.messages.push(message);
    setTimeout(() => {
      this.message.setValue('');
    }, 200);

    this.isTyping = true;
    this.chatGptService.ask(message).subscribe((messages) => {
      this.message.setValue('');

      this.isTyping = false;
      this.messages = [
        ...this.messages,
        ...[
          {
            text: '',
            index: 0,
            logprobs: null,
            finishReason: 'length',
          },
        ],
      ];
      const element = this.container.nativeElement as HTMLDivElement;
      const scroll = element.scrollHeight;
      setTimeout(() => {
        element.scroll({
          top: scroll,
          behavior: 'smooth',
        });
      });
    });
  }
}
