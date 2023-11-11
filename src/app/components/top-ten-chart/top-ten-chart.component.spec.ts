import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTenChartComponent } from './top-ten-chart.component';

describe('TopTenChartComponent', () => {
  let component: TopTenChartComponent;
  let fixture: ComponentFixture<TopTenChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopTenChartComponent],
    });
    fixture = TestBed.createComponent(TopTenChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
