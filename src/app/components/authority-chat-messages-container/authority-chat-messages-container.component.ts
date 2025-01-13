import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SlideMessageAnimation } from '@animations/slide-message.animation';
import { BaseChatMessagesContainerDirective } from '@directives/base-chat-messages-container.directive';
import { TextWritingAnimatorDirective } from '@directives/text-writing-animator.directive';
import { AuthorityMessage } from '@models/authority-message';
import { AuthorityChatService } from '@services/authority-chat.service';

@Component({
  selector: 'app-authority-chat-messages-container',
  standalone: true,
  imports: [CommonModule, TextWritingAnimatorDirective],
  templateUrl: './authority-chat-messages-container.component.html',
  styleUrl: './authority-chat-messages-container.component.scss',
  animations: [SlideMessageAnimation],
})
export class AuthorityChatMessagesContainerComponent extends BaseChatMessagesContainerDirective<
  AuthorityMessage,
  AuthorityChatService
> {
  override isMe(message: AuthorityMessage) {
    return message.isUser();
  }

  override getUserMessage(message: AuthorityMessage): string {
    return message.content;
  }

  animationStatusChanged(isAnimating: boolean, message: AuthorityMessage) {
    if (!isAnimating) {
      message.freezeAnimation();
      this.botService.notifyMessageWritingDone();
    }
  }
}
