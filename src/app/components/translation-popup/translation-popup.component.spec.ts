import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationPopupComponent } from './translation-popup.component';

describe('TranslationPopupComponent', () => {
  let component: TranslationPopupComponent;
  let fixture: ComponentFixture<TranslationPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslationPopupComponent]
    });
    fixture = TestBed.createComponent(TranslationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
