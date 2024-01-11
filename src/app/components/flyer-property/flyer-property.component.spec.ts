import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyerPropertyComponent } from './flyer-property.component';

describe('FlyerPropertyComponent', () => {
  let component: FlyerPropertyComponent;
  let fixture: ComponentFixture<FlyerPropertyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlyerPropertyComponent]
    });
    fixture = TestBed.createComponent(FlyerPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
