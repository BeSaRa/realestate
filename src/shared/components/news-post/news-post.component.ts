import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsPost } from '../news-section/news-section.component';
import { ChipComponent } from '../chip/chip.component';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-news-post',
  standalone: true,
  imports: [CommonModule, MatIconModule, ChipComponent, ButtonComponent],
  templateUrl: './news-post.component.html',
  styleUrls: ['./news-post.component.scss'],
})
export class NewsPostComponent {
  @Input({ required: true }) post!: NewsPost;
}
