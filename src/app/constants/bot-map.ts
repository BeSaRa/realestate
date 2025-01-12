import { BaseChatService } from '@abstracts/base-chat.service';
import { ComponentType } from '@angular/cdk/portal';
import { Type } from '@angular/core';
import { AuthorityChatMessagesContainerComponent } from '@components/authority-chat-messages-container/authority-chat-messages-container.component';
import { AvatarBotActionComponent } from '@components/avatar-bot-action/avatar-bot-action.component';
import { QrepChatMessagesContainerComponent } from '@components/qrep-chat-messages-container/qrep-chat-messages-container.component';
import { SpeechRecognizerBotActionComponent } from '@components/speech-recognizer-bot-action/speech-recognizer-bot-action.component';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { BaseBotActionDirective } from '@directives/base-bot-action.directive';
import { BaseChatMessagesContainerDirective } from '@directives/base-chat-messages-container.directive';
import { BotType } from '@enums/bot-type';
import { AuthorityChatService } from '@services/authority-chat.service';
import { QrepChatService } from '@services/qrep-chat.service';

export const BotMap: Record<
  BotType,
  {
    langKey: keyof LangKeysContract;
    chatServiceType: Type<BaseChatService>;
    component: ComponentType<BaseChatMessagesContainerDirective>;
    actionComponents: ComponentType<BaseBotActionDirective>[];
    allowCurrentLangLettersOnly: boolean;
  }
> = {
  [BotType.QREP]: {
    langKey: 'qatar_real_estate_platform',
    chatServiceType: QrepChatService,
    component: QrepChatMessagesContainerComponent,
    actionComponents: [SpeechRecognizerBotActionComponent],
    allowCurrentLangLettersOnly: true,
  },
  [BotType.AUTHORITY]: {
    langKey: 'real_estate_regularity_authority',
    chatServiceType: AuthorityChatService,
    component: AuthorityChatMessagesContainerComponent,
    actionComponents: [SpeechRecognizerBotActionComponent, AvatarBotActionComponent],
    allowCurrentLangLettersOnly: false,
  },
};
