import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../title/title.component';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, TitleComponent],
  templateUrl: './services-section.component.html',
  styleUrls: ['./services-section.component.scss'],
})
export class ServicesSectionComponent {
  links = [
    'تقارير البيع السنوية',
    'مؤشرات بداية العام',
    'مؤشر التقارير الشهرية',
  ];
}
