import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../title/title.component';
import { NewsPostComponent } from '../news-post/news-post.component';
import { ButtonComponent } from '../button/button.component';
import { MatIconModule } from '@angular/material/icon';

export interface NewsPost {
  title: string;
  body: string;
  date: string;
  imgUrl: string;
  tags: string[];
  links: { icon: string; link: string }[];
}

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TitleComponent,
    NewsPostComponent,
    ButtonComponent,
  ],
  templateUrl: './news-section.component.html',
  styleUrls: ['./news-section.component.scss'],
})
export class NewsSectionComponent {
  newsPosts: NewsPost[] = [
    {
      title: 'حجم التداول العقاري تجاوز 284 مليون ريال قطر الأسبوع الماضي',
      body: 'ليبين المارق الشمال مدن ان, ذلك ثانية الشتاء أن. خيار الشتوية ذلك عن. إنطلاق تكتيكاً المشتّتون أي هذا. ومن لعملة بقيادة الوزراء أم, أخذ إذ لفشل علاقة بمباركة. وتم مع الشهيرة والفرنسي. لكل لم وترك استعملت, ٣٠ ببعض يذكر مسؤولية حين, بعد مايو اوروبا قد.',
      date: '05 مارس 2023',
      imgUrl: '../../../assets/images/BQ8A1725.jpg',
      tags: ['وطني', 'وطني'],
      links: [
        { icon: 'print', link: '' },
        { icon: 'facebook', link: '' },
        { icon: 'twitter', link: '' },
      ],
    },
    {
      title: 'حجم التداول العقاري تجاوز 284 مليون ريال قطر الأسبوع الماضي',
      body: 'ليبين المارق الشمال مدن ان, ذلك ثانية الشتاء أن. خيار الشتوية ذلك عن. إنطلاق تكتيكاً المشتّتون أي هذا. ومن لعملة بقيادة الوزراء أم, أخذ إذ لفشل علاقة بمباركة. وتم مع الشهيرة والفرنسي. لكل لم وترك استعملت, ٣٠ ببعض يذكر مسؤولية حين, بعد مايو اوروبا قد.',
      date: '05 مارس 2023',
      imgUrl: '../../../assets/images/BQ8A1725.jpg',
      tags: ['وطني', 'وطني'],
      links: [
        { icon: 'print', link: '' },
        { icon: 'facebook', link: '' },
        { icon: 'twitter', link: '' },
      ],
    },
  ];
}
