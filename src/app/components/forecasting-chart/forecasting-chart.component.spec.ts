import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastingChartComponent } from './forecasting-chart.component';

describe('SellForecastingChartComponent', () => {
  let component: ForecastingChartComponent;
  let fixture: ComponentFixture<ForecastingChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForecastingChartComponent],
    });
    fixture = TestBed.createComponent(ForecastingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
