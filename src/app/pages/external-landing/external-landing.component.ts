import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-external-landing',
  imports: [RouterModule],
  templateUrl: './external-landing.component.html',
  styleUrl: './external-landing.component.scss',
})
export default class ExternalLandingComponent {
  lang = inject(TranslationService);
}
