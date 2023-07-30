import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurposeComponent } from './purpose.component';

describe('PurposeComponent', () => {
  let component: PurposeComponent;
  let fixture: ComponentFixture<PurposeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PurposeComponent],
    });
    fixture = TestBed.createComponent(PurposeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
