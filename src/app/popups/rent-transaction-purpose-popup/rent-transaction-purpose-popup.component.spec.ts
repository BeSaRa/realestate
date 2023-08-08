import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentTransactionPurposePopupComponent } from './rent-transaction-purpose-popup.component';

describe('RentTransactionPurposePopupComponent', () => {
  let component: RentTransactionPurposePopupComponent;
  let fixture: ComponentFixture<RentTransactionPurposePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RentTransactionPurposePopupComponent],
    });
    fixture = TestBed.createComponent(RentTransactionPurposePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
