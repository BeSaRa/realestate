import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { createItem } from '@directus/sdk';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { DirectusClientService } from '@services/directus-client.service';
import { TranslationService } from '@services/translation.service';
import { catchError, from, takeUntil, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [
    CommonModule,
    IconButtonComponent,
    InputSuffixDirective,
    InputComponent,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './newsletter-form.component.html',
  styleUrls: ['./newsletter-form.component.scss'],
})
export class NewsletterFormComponent extends OnDestroyMixin(class {}) {
  lang = inject(TranslationService);
  directusClient = inject(DirectusClientService);
  snackBar = inject(MatSnackBar);

  newsletterControl = new FormControl<string | undefined>(undefined, [Validators.required, Validators.email]);

  isLoading = false;

  onSubscribe() {
    if (!this.newsletterControl.valid) return;

    this.isLoading = true;
    from(
      this.directusClient.client.request(
        createItem('newsletter', { email: this.newsletterControl.value ?? '', subscription: true })
      )
    )
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.isLoading = false)),
        tap(() => this.snackBar.open(this.lang.map.you_have_successfully_subscribed_to_the_newsletter)),
        tap(() => this.newsletterControl.reset()),
        catchError((err) => {
          this.isLoading = false;
          return throwError(() => err);
        })
      )
      .subscribe();
  }
}
