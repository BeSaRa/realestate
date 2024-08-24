import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-developer-registration-success-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './developer-registration-success-page.component.html',
  styleUrl: './developer-registration-success-page.component.scss',
})
export default class DeveloperRegistrationSuccessPageComponent {
  lang = inject(TranslationService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  registerNew() {
    this.router.navigate(['../developer-registration'], { relativeTo: this.route });
  }
}
