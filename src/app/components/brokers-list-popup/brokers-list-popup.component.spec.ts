import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokersListPopupComponent } from './brokers-list-popup.component';

describe('BrokersListPopupComponent', () => {
  let component: BrokersListPopupComponent;
  let fixture: ComponentFixture<BrokersListPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrokersListPopupComponent]
    });
    fixture = TestBed.createComponent(BrokersListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
