import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupChartComponent } from './popup-chart.component';

describe('PopupChartComponent', () => {
  let component: PopupChartComponent;
  let fixture: ComponentFixture<PopupChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PopupChartComponent]
    });
    fixture = TestBed.createComponent(PopupChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
