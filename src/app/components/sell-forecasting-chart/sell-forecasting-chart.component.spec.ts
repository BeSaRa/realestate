import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellForecastingChartComponent } from './sell-forecasting-chart.component';

describe('SellForecastingChartComponent', () => {
  let component: SellForecastingChartComponent;
  let fixture: ComponentFixture<SellForecastingChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SellForecastingChartComponent],
    });
    fixture = TestBed.createComponent(SellForecastingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
