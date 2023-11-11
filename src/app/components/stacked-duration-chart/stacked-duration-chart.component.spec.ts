import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedDurationChartComponent } from './stacked-duration-chart.component';

describe('StackedDurationChartComponent', () => {
  let component: StackedDurationChartComponent;
  let fixture: ComponentFixture<StackedDurationChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StackedDurationChartComponent],
    });
    fixture = TestBed.createComponent(StackedDurationChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
