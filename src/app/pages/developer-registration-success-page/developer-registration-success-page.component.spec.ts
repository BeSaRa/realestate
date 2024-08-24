import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperRegistrationSuccessPageComponent } from './developer-registration-success-page.component';

describe('DeveloperRegistrationSuccessPageComponent', () => {
  let component: DeveloperRegistrationSuccessPageComponent;
  let fixture: ComponentFixture<DeveloperRegistrationSuccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperRegistrationSuccessPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeveloperRegistrationSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
