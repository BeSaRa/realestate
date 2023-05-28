import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressInquiryComponent } from './address-inquiry.component';

describe('AddressInquiryComponent', () => {
  let component: AddressInquiryComponent;
  let fixture: ComponentFixture<AddressInquiryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddressInquiryComponent]
    });
    fixture = TestBed.createComponent(AddressInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
