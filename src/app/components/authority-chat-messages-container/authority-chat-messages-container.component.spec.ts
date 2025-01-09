import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorityChatMessagesContainerComponent } from './authority-chat-messages-container.component';

describe('AuthorityChatMessagesContainerComponent', () => {
  let component: AuthorityChatMessagesContainerComponent;
  let fixture: ComponentFixture<AuthorityChatMessagesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorityChatMessagesContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthorityChatMessagesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
