import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './newsletter-form.component.html',
  styleUrls: ['./newsletter-form.component.scss'],
})
export class NewsletterFormComponent {
  lang = inject(TranslationService);
}
