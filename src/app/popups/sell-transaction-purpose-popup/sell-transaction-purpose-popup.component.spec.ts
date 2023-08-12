import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellTransactionPurposePopupComponent } from './sell-transaction-purpose-popup.component';

describe('SellTransactionPurposePopupComponent', () => {
  let component: SellTransactionPurposePopupComponent;
  let fixture: ComponentFixture<SellTransactionPurposePopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SellTransactionPurposePopupComponent]
    });
    fixture = TestBed.createComponent(SellTransactionPurposePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
