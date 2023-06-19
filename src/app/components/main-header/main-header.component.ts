import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  lang = inject(TranslationService);
}
