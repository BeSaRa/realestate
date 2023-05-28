import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../title/title.component';
import { InputComponent } from '../input/input.component';
import { MatIconModule } from '@angular/material/icon';
import { InputSuffixDirective } from 'src/shared/directives/input-suffix.directive';

@Component({
  selector: 'app-news-letter',
  standalone: true,
  imports: [
    CommonModule,
    TitleComponent,
    InputComponent,
    MatIconModule,
    InputSuffixDirective,
  ],
  templateUrl: './news-letter.component.html',
  styleUrls: ['./news-letter.component.scss'],
})
export class NewsLetterComponent {}
