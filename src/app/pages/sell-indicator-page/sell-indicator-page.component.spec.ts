import { ComponentFixture, TestBed } from '@angular/core/testing';

import SellIndicatorPageComponent from './sell-indicator-page.component';

describe('SellIndicatorPageComponent', () => {
  let component: SellIndicatorPageComponent;
  let fixture: ComponentFixture<SellIndicatorPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SellIndicatorPageComponent],
    });
    fixture = TestBed.createComponent(SellIndicatorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
