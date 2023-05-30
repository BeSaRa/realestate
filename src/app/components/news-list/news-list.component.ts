import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NewsItemComponent } from '../news-item/news-item.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NewsItemComponent],
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent {}
