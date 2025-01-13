import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { SpeechTokenContract } from '@contracts/speech-token-contract';
import { AudioConfig, AutoDetectSourceLanguageConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { ConfigService } from './config.service';
import { catchError, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private _http = inject(HttpClient);
  private _configService = inject(ConfigService);

  private _speechToken = signal<undefined | SpeechTokenContract>(undefined);
  speechToken = computed(() => this._speechToken());

  readonly audioConfig = AudioConfig.fromDefaultMicrophoneInput();
  readonly langDetection = AutoDetectSourceLanguageConfig.fromLanguages(
    this._configService.CONFIG.AUTHORITY_AI.SPEECH_LANGUAGES
  );

  generateSpeechToken(update = false) {
    if (this._speechToken() && !update) return of(this._speechToken());
    return this._http.get<SpeechTokenContract>(this._configService.CONFIG.AUTHORITY_AI.BASE_URL + '/speech/token').pipe(
      tap((res) => this._speechToken.set(res)),
      catchError((err) => {
        this._speechToken.set(undefined);
        return throwError(() => err);
      })
    );
  }
}
