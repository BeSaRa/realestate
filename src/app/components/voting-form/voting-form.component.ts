import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
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
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { from, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ButtonComponent,
    MatRadioModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.scss'],
})
export class VotingFormComponent extends OnDestroyMixin(class {}) implements OnInit {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  directusClient = inject(DirectusClientService);
  lang = inject(TranslationService);

  voteControl = new FormControl<number | undefined>(undefined, [Validators.required]);
  vote!: Vote;

  isLoading = false;

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

  onVote() {
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
        tap((_vote) => (this.vote = _vote)),
        tap(() => (this.isLoading = false))
      )
      .subscribe();
  }

  getTotalVotes() {
    let sum = 0;
    this.vote?.vote_items.forEach((i) => (sum += i.counts));
    return sum;
  }
}
