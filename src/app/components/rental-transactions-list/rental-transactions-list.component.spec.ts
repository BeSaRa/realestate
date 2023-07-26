import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalTransactionsListComponent } from './rental-transactions-list.component';

describe('RentalTransactionsListComponent', () => {
  let component: RentalTransactionsListComponent;
  let fixture: ComponentFixture<RentalTransactionsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RentalTransactionsListComponent]
    });
    fixture = TestBed.createComponent(RentalTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
