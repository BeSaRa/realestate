import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SlideFromBottom } from '@animations/slide-from-bottom.animation';
import { SlideMessageAnimation } from '@animations/slide-message.animation';
import { AuthorityFaqContract } from '@contracts/authority-faq-contract';
import { BaseChatMessagesContainerDirective } from '@directives/base-chat-messages-container.directive';
import { TextWritingAnimatorDirective } from '@directives/text-writing-animator.directive';
import { ChatFeedback } from '@enums/chat-feedback';
import { AuthorityMessage } from '@models/authority-message';
import { AuthorityChatHistoryService } from '@services/authority-chat-history.service';
import { AuthorityChatService } from '@services/authority-chat.service';
import { AuthorityFaqService } from '@services/authority-faq.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-authority-chat-messages-container',
  standalone: true,
  imports: [CommonModule, TextWritingAnimatorDirective],
  templateUrl: './authority-chat-messages-container.component.html',
  styleUrl: './authority-chat-messages-container.component.scss',
  animations: [SlideMessageAnimation, SlideFromBottom],
})
export class AuthorityChatMessagesContainerComponent
  extends BaseChatMessagesContainerDirective<AuthorityMessage, AuthorityChatService>
  implements OnInit
{
  authorityChatHistoryService = inject(AuthorityChatHistoryService);
  authorityFaqService = inject(AuthorityFaqService);

  isConversationRated = computed(() => this.chatService().isConversationRated());
  isRating = false;

  readonly chatFeedback = ChatFeedback;

  private _faq = signal<AuthorityFaqContract[]>([]);
  faq = computed(() => this._faq().sort((a, b) => b.TotalCount - a.TotalCount));

  ngOnInit(): void {
    this.authorityFaqService.getFaq().subscribe((res) => this._faq.set(res));
  }

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

  rateConversation(feedback: ChatFeedback) {
    this.isRating = true;
    this.authorityChatHistoryService
      .addFeedback(this.chatService().conversationId!, feedback)
      .pipe(finalize(() => (this.isRating = false)))
      .subscribe(() => {
        this.chatService().rateConversationDone();
      });
  }

  askFaq(message: string) {
    this.botService.sendMessage(message).subscribe();
  }
}
