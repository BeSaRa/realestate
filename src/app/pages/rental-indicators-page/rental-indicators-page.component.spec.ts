import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalIndicatorsPageComponent } from './rental-indicators-page.component';

describe('RentalIndicatorsPageComponent', () => {
  let component: RentalIndicatorsPageComponent;
  let fixture: ComponentFixture<RentalIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RentalIndicatorsPageComponent]
    });
    fixture = TestBed.createComponent(RentalIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
