import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrepChatDataViewComponent } from './qrep-chat-data-view.component';

describe('ChatGptDataViewComponent', () => {
  let component: QrepChatDataViewComponent;
  let fixture: ComponentFixture<QrepChatDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrepChatDataViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrepChatDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
