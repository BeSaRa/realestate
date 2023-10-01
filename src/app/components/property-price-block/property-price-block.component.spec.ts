import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyPriceBlockComponent } from './property-price-block.component';

describe('PropertyPriceBlockComponent', () => {
  let component: PropertyPriceBlockComponent;
  let fixture: ComponentFixture<PropertyPriceBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PropertyPriceBlockComponent],
    });
    fixture = TestBed.createComponent(PropertyPriceBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
