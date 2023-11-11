import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalitiesChartComponent } from './municipalities-chart.component';

describe('MunicipalitiesChartComponent', () => {
  let component: MunicipalitiesChartComponent;
  let fixture: ComponentFixture<MunicipalitiesChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MunicipalitiesChartComponent],
    });
    fixture = TestBed.createComponent(MunicipalitiesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
