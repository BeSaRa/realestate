import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { AppIcons } from '@constants/app-icons';
import { createItem } from '@directus/sdk';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Vote } from '@models/vote';
import { DirectusClientService } from '@services/directus-client.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { RECAPTCHA_SETTINGS, RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { finalize, from, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    MatRadioModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
    RecaptchaModule,
  ],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.scss'],
})
export class VotingFormComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;

  http = inject(HttpClient);
  urlService = inject(UrlService);
  directusClient = inject(DirectusClientService);
  lang = inject(TranslationService);
  toast = inject(ToastService);
  recaptchaSettings = inject(RECAPTCHA_SETTINGS);

  voteControl = new FormControl<number | undefined>(undefined, [Validators.required]);
  vote!: Vote;

  isLoading = false;
  isRecaptchaVisible = false;
  isRecaptchaResolved = false;
  isWaitingForRecaptchaResolve = false;

  appIcons = AppIcons;

  ngOnInit(): void {
    this.isLoading = true;
    this.http
      .get<Vote>(this.urlService.URLS.MAIN_VOTE)
      .pipe(
        takeUntil(this.destroy$),
        tap((_vote) => (this.vote = _vote)),
        tap((_vote) => {
          if (_vote.voted) {
            this.voteControl.setValue(_vote.vote_items.find((item) => item.voted)?.id);
          }
        }),
        tap(() => (this.isLoading = false))
      )
      .subscribe();
  }

  onSubmit() {
    if (!this.isRecaptchaResolved) {
      this.isRecaptchaVisible = true;
      this.isWaitingForRecaptchaResolve = true;
    } else {
      this._vote();
    }
  }

  onRecaptchaResolved(token: string) {
    if (!token) return;
    this.isRecaptchaResolved = true;
    this.isWaitingForRecaptchaResolve = false;
    this._vote();
  }

  private _vote() {
    if (!this.voteControl.valid) return;
    this.isLoading = true;
    from(
      this.directusClient.client.request(
        createItem('vote_history', { vote_id: this.vote.id, vote_item_id: this.voteControl.value ?? 0 })
      )
    )
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.http.get<Vote>(this.urlService.URLS.MAIN_VOTE)),
        tap(() => this.toast.success(this.lang.map.you_have_successfully_voted_on_this_poll)),
        tap((_vote) => (this.vote = _vote)),
        tap(() => (this.isLoading = false)),
        finalize(() => {
          this.isRecaptchaResolved = false;
          this.isRecaptchaVisible = false;
          this.recaptcha.reset();
        })
      )
      .subscribe();
  }

  getTotalVotes() {
    let sum = 0;
    this.vote?.vote_items.forEach((i) => (sum += i.counts));
    return sum;
  }
}
