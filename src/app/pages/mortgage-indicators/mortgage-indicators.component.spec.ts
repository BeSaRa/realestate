import { ComponentFixture, TestBed } from '@angular/core/testing';

import MortgageIndicatorsComponent from './mortgage-indicators.component';

describe('MortgageIndicatorsComponent', () => {
  let component: MortgageIndicatorsComponent;
  let fixture: ComponentFixture<MortgageIndicatorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MortgageIndicatorsComponent],
    });
    fixture = TestBed.createComponent(MortgageIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
