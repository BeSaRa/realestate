import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceRecorderBotActionComponent } from './voice-recorder-bot-action.component';

describe('VoiceRecorderBotActionComponent', () => {
  let component: VoiceRecorderBotActionComponent;
  let fixture: ComponentFixture<VoiceRecorderBotActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceRecorderBotActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoiceRecorderBotActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
