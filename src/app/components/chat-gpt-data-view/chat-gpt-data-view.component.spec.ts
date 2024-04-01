import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGptDataViewComponent } from './chat-gpt-data-view.component';

describe('ChatGptDataViewComponent', () => {
  let component: ChatGptDataViewComponent;
  let fixture: ComponentFixture<ChatGptDataViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatGptDataViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatGptDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
