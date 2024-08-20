import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperRegistrationPageComponent } from './developer-registration-page.component';

describe('DeveloperRegistrationPageComponent', () => {
  let component: DeveloperRegistrationPageComponent;
  let fixture: ComponentFixture<DeveloperRegistrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperRegistrationPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeveloperRegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
