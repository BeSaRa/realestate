import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRegistrationPageComponent } from './interest-registration-page.component';

describe('InterestRegistrationPageComponent', () => {
  let component: InterestRegistrationPageComponent;
  let fixture: ComponentFixture<InterestRegistrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestRegistrationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestRegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
