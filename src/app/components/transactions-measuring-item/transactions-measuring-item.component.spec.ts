import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsMeasuringItemComponent } from './transactions-measuring-item.component';

describe('TransactionsMeasuringItemComponent', () => {
  let component: TransactionsMeasuringItemComponent;
  let fixture: ComponentFixture<TransactionsMeasuringItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TransactionsMeasuringItemComponent]
    });
    fixture = TestBed.createComponent(TransactionsMeasuringItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
