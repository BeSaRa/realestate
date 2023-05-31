import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ExtraHeaderComponent } from 'src/app/components/extra-header/extra-header.component';
import { MatButtonModule } from '@angular/material/button';
import { NewsListComponent } from 'src/app/components/news-list/news-list.component';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent, NgOptimizedImage, MatButtonModule, NewsListComponent],
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.scss'],
})
export class NewsPageComponent {}
