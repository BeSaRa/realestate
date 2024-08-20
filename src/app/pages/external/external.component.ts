import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-external',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './external.component.html',
  styleUrl: './external.component.scss',
})
export class ExternalComponent {
  lang = inject(TranslationService);
}
