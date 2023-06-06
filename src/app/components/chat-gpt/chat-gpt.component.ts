import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-chat-gpt',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
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
  ],
})
export class ChatGptComponent {
  isOpened: 'close' | 'open' = 'close';
  isHidden = false;
  isFullScreen = false;

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
}
