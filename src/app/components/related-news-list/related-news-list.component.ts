import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { News } from '@models/news';
import { NewsItemComponent } from '@components/news-item/news-item.component';

@Component({
  selector: 'app-related-news-list',
  standalone: true,
  imports: [CommonModule, NewsItemComponent],
  templateUrl: './related-news-list.component.html',
  styleUrls: ['./related-news-list.component.scss'],
})
export class RelatedNewsListComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) newsData!: News[];
  @Input() panelClass!: string;
}
