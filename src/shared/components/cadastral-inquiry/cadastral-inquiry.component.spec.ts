import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastralInquiryComponent } from './cadastral-inquiry.component';

describe('CadastralInquiryComponent', () => {
  let component: CadastralInquiryComponent;
  let fixture: ComponentFixture<CadastralInquiryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CadastralInquiryComponent]
    });
    fixture = TestBed.createComponent(CadastralInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
