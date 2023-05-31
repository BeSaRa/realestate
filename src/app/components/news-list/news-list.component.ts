import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { News } from '@models/news';
import { NewsItemComponent } from '../news-item/news-item.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NewsItemComponent],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) newsData!: News[] | null;
}
