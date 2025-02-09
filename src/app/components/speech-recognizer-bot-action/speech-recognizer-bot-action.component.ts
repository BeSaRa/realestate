import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseBotActionDirective } from '@directives/base-bot-action.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { BotService } from '@services/bot.service';
import { SpeechService } from '@services/speech.service';
import {
  Recognizer,
  ResultReason,
  SpeechConfig,
  SpeechRecognitionEventArgs,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';
import { finalize, of, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-speech-recognizer-bot-action',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './speech-recognizer-bot-action.component.html',
  styleUrl: './speech-recognizer-bot-action.component.scss',
})
export class SpeechRecognizerBotActionComponent
  extends OnDestroyMixin(BaseBotActionDirective)
  implements OnInit, OnDestroy
{
  speechService = inject(SpeechService);
  botService = inject(BotService);

  recognizer?: SpeechRecognizer;

  private _recognizedText = '';
  recognizingText = signal('');

  private _recordingStatus: 'started' | 'stopped' | 'loading' = 'stopped';

  ngOnInit(): void {
    this._listenToMessageSent();
    this._initRecognizer().subscribe();
  }

  toggleRecording() {
    if (this.isPaused()) return;
    if (this.isStarted()) this.stopRecording();
    else this.startRecording();
  }

  startRecording() {
    if (this.isStarted()) return;
    (this.recognizer ? of(undefined) : this._initRecognizer()).subscribe(() => {
      this._pause();
      this.recognizer!.startContinuousRecognitionAsync(() => {
        if ((this.recognizer!.internalData as unknown as any).privConnectionPromise.__zone_symbol__state === true) {
          this._clearText();
          this._start();
        }
      });
    });
  }

  stopRecording() {
    if (this.isStopped()) return;
    if (this.recognizer) {
      this.recognizer.stopContinuousRecognitionAsync(() => {
        this._clearText();
      });
    }
    this._stop();
  }

  isStarted() {
    return this._recordingStatus === 'started';
  }

  isStopped() {
    return this._recordingStatus === 'stopped';
  }

  isPaused() {
    return this._recordingStatus === 'loading';
  }

  private _start() {
    this.botService.enableExternalSourceMessageWriting();
    this._recordingStatus = 'started';
  }

  private _stop() {
    this.botService.disableExternalSourceMessageWriting();
    this._recordingStatus = 'stopped';
  }

  private _pause() {
    this._recordingStatus = 'loading';
  }

  private _listenToMessageSent() {
    this.botService.messageSent$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._clearText();
    });
  }

  private _initRecognizer(updateToken = false) {
    this._pause();
    return this.speechService.generateSpeechToken(updateToken).pipe(
      tap(() => this._prepareRecognizer()),
      finalize(() => this._stop())
    );
  }

  private _prepareRecognizer() {
    this.recognizer = SpeechRecognizer.FromConfig(
      SpeechConfig.fromAuthorizationToken(
        this.speechService.speechToken()!.token,
        this.speechService.speechToken()!.region
      ),
      this.speechService.langDetection,
      this.speechService.audioConfig
    );

    this.recognizer.recognized = this._recognizeFn;
    this.recognizer.recognizing = this._recognizeFn;
    this.recognizer.canceled = this._cancelledFn;
  }

  private _recognizeFn = (rec: Recognizer, event: SpeechRecognitionEventArgs) => {
    if (event.result.reason === ResultReason.RecognizingSpeech) {
      this._updateText(event.result.text);
    }
    if (event.result.reason === ResultReason.RecognizedSpeech) {
      this._recognizedText = this._recognizedText + event.result.text;
    }
  };

  private _cancelledFn = () => {
    this._initRecognizer(true).subscribe();
  };

  private _updateText(text: string) {
    this.recognizingText.set(this._recognizedText + ' ' + text);
    this.botService.writeUserMessageFromExternalSource(this.recognizingText());
  }

  private _clearText() {
    this._recognizedText = '';
    this.recognizingText.set('');
    this.botService.writeUserMessageFromExternalSource('');
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._stop();
    this._clearText();
  }
}
