import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SlideMessageAnimation } from '@animations/slide-message.animation';
import { QrepChatDataViewComponent } from '@components/qrep-chat-data-view/qrep-chat-data-view.component';
import { QrepChatResponseContract, QrepChatResponseFormat } from '@contracts/qrep-chat-message-contract';
import { BaseChatMessagesContainerDirective } from '@directives/base-chat-messages-container.directive';
import { QrepChatService } from '@services/qrep-chat.service';

@Component({
  selector: 'app-qrep-chat-messages-container',
  standalone: true,

  imports: [CommonModule, QrepChatDataViewComponent],
  templateUrl: './qrep-chat-messages-container.component.html',
  styleUrl: './qrep-chat-messages-container.component.scss',
  animations: [SlideMessageAnimation],
})
export class QrepChatMessagesContainerComponent extends BaseChatMessagesContainerDirective<
  QrepChatResponseContract,
  QrepChatService
> {
  override isMe(message: QrepChatResponseContract): boolean {
    return typeof message === 'string';
  }

  override getUserMessage(message: QrepChatResponseContract): string {
    return typeof message === 'string' ? message : '';
  }

  isError(message: QrepChatResponseContract) {
    return message.responseFormat === QrepChatResponseFormat.ERROR;
  }

  isInvalid(message: QrepChatResponseContract) {
    return message.responseFormat === QrepChatResponseFormat.INVALID;
  }
}
