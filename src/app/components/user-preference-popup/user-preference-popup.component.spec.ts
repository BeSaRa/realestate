import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencePopupComponent } from './user-preference-popup.component';

describe('UserPreferencePopupComponent', () => {
  let component: UserPreferencePopupComponent;
  let fixture: ComponentFixture<UserPreferencePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserPreferencePopupComponent]
    });
    fixture = TestBed.createComponent(UserPreferencePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
