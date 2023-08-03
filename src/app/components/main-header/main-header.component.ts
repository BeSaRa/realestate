import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, NgOptimizedImage],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  lang = inject(TranslationService);
  sticky = inject(StickyService);
}
