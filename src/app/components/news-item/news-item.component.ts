import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { News } from '@models/news';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss'],
})
export class NewsItemComponent {
  @Input({ required: true }) newsItemData!: News;
}
