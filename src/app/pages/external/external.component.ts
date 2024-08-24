import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-external',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonComponent],
  templateUrl: './external.component.html',
  styleUrl: './external.component.scss',
})
export class ExternalComponent {
  lang = inject(TranslationService);

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }
}
