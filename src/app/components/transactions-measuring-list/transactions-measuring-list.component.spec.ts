import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsMeasuringListComponent } from './transactions-measuring-list.component';

describe('TransactionsMeasuringListComponent', () => {
  let component: TransactionsMeasuringListComponent;
  let fixture: ComponentFixture<TransactionsMeasuringListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TransactionsMeasuringListComponent]
    });
    fixture = TestBed.createComponent(TransactionsMeasuringListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
