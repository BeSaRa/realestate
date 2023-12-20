import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastingIndicatorsPageComponent } from './forecasting-indicators-page.component';

describe('ForecastingIndicatorsPageComponent', () => {
  let component: ForecastingIndicatorsPageComponent;
  let fixture: ComponentFixture<ForecastingIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForecastingIndicatorsPageComponent]
    });
    fixture = TestBed.createComponent(ForecastingIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
