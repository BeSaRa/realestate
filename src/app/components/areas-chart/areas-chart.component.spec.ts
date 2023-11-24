import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasChartComponent } from './areas-chart.component';

describe('AreasChartComponent', () => {
  let component: AreasChartComponent;
  let fixture: ComponentFixture<AreasChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AreasChartComponent]
    });
    fixture = TestBed.createComponent(AreasChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
