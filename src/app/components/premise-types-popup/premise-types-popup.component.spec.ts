import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiseTypesPopupComponent } from './premise-types-popup.component';

describe('PremiseTypesPopupComponent', () => {
  let component: PremiseTypesPopupComponent;
  let fixture: ComponentFixture<PremiseTypesPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PremiseTypesPopupComponent],
    });
    fixture = TestBed.createComponent(PremiseTypesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
