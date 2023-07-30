import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalTransactionsMeasuringComponent } from './rental-transactions-measuring.component';

describe('RentalTransactionsMeasuringComponent', () => {
  let component: RentalTransactionsMeasuringComponent;
  let fixture: ComponentFixture<RentalTransactionsMeasuringComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RentalTransactionsMeasuringComponent],
    });
    fixture = TestBed.createComponent(RentalTransactionsMeasuringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
