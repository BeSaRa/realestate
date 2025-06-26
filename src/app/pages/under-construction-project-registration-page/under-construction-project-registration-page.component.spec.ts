import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderConstructionProjectRegistrationPageComponent } from './under-construction-project-registration-page.component';

describe('UnderConstructionProjectRegistrationPageComponent', () => {
  let component: UnderConstructionProjectRegistrationPageComponent;
  let fixture: ComponentFixture<UnderConstructionProjectRegistrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderConstructionProjectRegistrationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderConstructionProjectRegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
