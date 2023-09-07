import { ComponentFixture, TestBed } from '@angular/core/testing';

import OwnershipIndicatorsPageComponent from './ownership-indicators-page.component';

describe('OwnerIndicatorsPageComponent', () => {
  let component: OwnershipIndicatorsPageComponent;
  let fixture: ComponentFixture<OwnershipIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OwnershipIndicatorsPageComponent],
    });
    fixture = TestBed.createComponent(OwnershipIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
