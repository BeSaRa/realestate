import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCarouselComponent } from './property-carousel.component';

describe('PropertyCarouselComponent', () => {
  let component: PropertyCarouselComponent;
  let fixture: ComponentFixture<PropertyCarouselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PropertyCarouselComponent],
    });
    fixture = TestBed.createComponent(PropertyCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
