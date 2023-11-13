import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerDetailsPopupComponent } from './broker-details-popup.component';

describe('BrokerDetailsPopupComponent', () => {
  let component: BrokerDetailsPopupComponent;
  let fixture: ComponentFixture<BrokerDetailsPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrokerDetailsPopupComponent]
    });
    fixture = TestBed.createComponent(BrokerDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
