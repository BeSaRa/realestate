import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyerSummaryComponent } from './flyer-summary.component';

describe('FlyerSummaryComponent', () => {
  let component: FlyerSummaryComponent;
  let fixture: ComponentFixture<FlyerSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlyerSummaryComponent]
    });
    fixture = TestBed.createComponent(FlyerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
