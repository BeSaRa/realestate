import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositeTransactionsTableComponent } from './composite-transactions-table.component';

describe('CompositeTransactionsTableComponent', () => {
  let component: CompositeTransactionsTableComponent;
  let fixture: ComponentFixture<CompositeTransactionsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompositeTransactionsTableComponent]
    });
    fixture = TestBed.createComponent(CompositeTransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
