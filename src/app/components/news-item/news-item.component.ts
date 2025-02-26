import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AppIcons } from '@constants/app-icons';
import { News } from '@models/news';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-news-item',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './news-item.component.html',
  styleUrls: ['./news-item.component.scss'],
})
export class NewsItemComponent {
  @Input({ required: true }) newsItemData!: News;
  @Input() type: 'concise' | 'full' = 'full';

  icons = AppIcons;

  lang = inject(TranslationService);
}
