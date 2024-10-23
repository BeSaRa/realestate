import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { CmsErrorContract } from '@contracts/cms-error-contract';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { createItem } from '@directus/sdk';
import { CmsErrorStatus } from '@enums/cms-error-status';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ConfigService } from '@services/config.service';
import { DirectusClientService } from '@services/directus-client.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { catchError, finalize, from, of, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-newsletter-form',
  standalone: true,
  imports: [
    CommonModule,
    IconButtonComponent,
    InputSuffixDirective,
    InputComponent,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    RecaptchaModule,
  ],
  templateUrl: './newsletter-form.component.html',
  styleUrls: ['./newsletter-form.component.scss'],
})
export class NewsletterFormComponent extends OnDestroyMixin(class {}) {
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;

  lang = inject(TranslationService);
  directusClient = inject(DirectusClientService);
  toast = inject(ToastService);
  config = inject(ConfigService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);

  newsletterControl = new FormControl<string | undefined>(undefined, [Validators.required, Validators.email]);

  isLoading = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  onSubmit() {
    if (!this.isRecaptchaResolved) {
      this.isRecaptchaVisible = true;
      this.isWaitingForRecaptchaResolve = true;
    } else {
      this._subscribe();
    }
  }

  onRecaptchaResolved(token: string) {
    if (!token) return;
    this.isRecaptchaResolved = true;
    this.isWaitingForRecaptchaResolve = false;
    this._subscribe();
  }

  private _subscribe() {
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
        tap(() => this.toast.success(this.lang.map.you_have_successfully_subscribed_to_the_newsletter)),
        tap(() => this.newsletterControl.reset()),
        catchError((err: CmsErrorContract) => {
          this.isLoading = false;
          if (err.errors) {
            err.errors.forEach((e) => {
              if (e.extensions.code === CmsErrorStatus.RECORD_NOT_UNIQUE) {
                this.toast.error(this.lang.map.entered_email_already_subscribed);
              }
              if (e.extensions.code === CmsErrorStatus.FAILED_VALIDATION) {
                this.toast.error(this.lang.map.email_is_invalid_please_try_again);
              }
            });
          }
          return of();
        }),
        finalize(() => {
          this.isRecaptchaResolved = false;
          this.isRecaptchaVisible = false;
          this.recaptcha.reset();
        })
      )
      .subscribe();
  }
}
