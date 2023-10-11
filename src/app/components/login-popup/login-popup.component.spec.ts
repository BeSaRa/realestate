import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPopupComponent } from './login-popup.component';

describe('TranslationPopupComponent', () => {
  let component: LoginPopupComponent;
  let fixture: ComponentFixture<LoginPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginPopupComponent],
    });
    fixture = TestBed.createComponent(LoginPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
