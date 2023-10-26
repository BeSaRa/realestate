import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupiedAndVacantIndicatorsPageComponent } from './occupied-and-vacant-indicators-page.component';

describe('OccupiedAndVacantIndicatorsPageComponent', () => {
  let component: OccupiedAndVacantIndicatorsPageComponent;
  let fixture: ComponentFixture<OccupiedAndVacantIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OccupiedAndVacantIndicatorsPageComponent]
    });
    fixture = TestBed.createComponent(OccupiedAndVacantIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
