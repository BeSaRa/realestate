import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../title/title.component';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-poll',
  standalone: true,
  imports: [CommonModule, TitleComponent, MatRadioModule, ButtonComponent],
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss'],
})
export class PollComponent {}
