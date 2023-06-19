import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
  lang = inject(TranslationService);
}
