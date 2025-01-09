import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrepChatMessagesContainerComponent } from './qrep-chat-messages-container.component';

describe('QrepChatMessagesContainerComponent', () => {
  let component: QrepChatMessagesContainerComponent;
  let fixture: ComponentFixture<QrepChatMessagesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrepChatMessagesContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QrepChatMessagesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
