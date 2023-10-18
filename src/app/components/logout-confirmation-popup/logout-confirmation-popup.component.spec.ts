import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutConfirmationPopupComponent } from './logout-confirmation-popup.component';

describe('LogoutConfirmationPopupComponent', () => {
  let component: LogoutConfirmationPopupComponent;
  let fixture: ComponentFixture<LogoutConfirmationPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LogoutConfirmationPopupComponent]
    });
    fixture = TestBed.createComponent(LogoutConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});