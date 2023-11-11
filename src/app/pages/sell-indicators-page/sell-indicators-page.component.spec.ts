import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellIndicatorsPageComponent } from './sell-indicators-page.component';

describe('SellIndicatorsPageComponent', () => {
  let component: SellIndicatorsPageComponent;
  let fixture: ComponentFixture<SellIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SellIndicatorsPageComponent],
    });
    fixture = TestBed.createComponent(SellIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
