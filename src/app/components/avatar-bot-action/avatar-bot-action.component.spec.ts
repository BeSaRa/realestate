import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarBotActionComponent } from './avatar-bot-action.component';

describe('AvatarComponent', () => {
  let component: AvatarBotActionComponent;
  let fixture: ComponentFixture<AvatarBotActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarBotActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarBotActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
