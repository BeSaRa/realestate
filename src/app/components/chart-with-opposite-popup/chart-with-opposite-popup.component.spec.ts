import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartWithOppositePopupComponent } from './chart-with-opposite-popup.component';

describe('PopupChartComponent', () => {
  let component: ChartWithOppositePopupComponent;
  let fixture: ComponentFixture<ChartWithOppositePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartWithOppositePopupComponent],
    });
    fixture = TestBed.createComponent(ChartWithOppositePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
