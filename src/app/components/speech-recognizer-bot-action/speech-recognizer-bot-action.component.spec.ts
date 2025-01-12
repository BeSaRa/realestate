import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeechRecognizerBotActionComponent } from './speech-recognizer-bot-action.component';

describe('VoiceRecorderBotActionComponent', () => {
  let component: SpeechRecognizerBotActionComponent;
  let fixture: ComponentFixture<SpeechRecognizerBotActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeechRecognizerBotActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeechRecognizerBotActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
