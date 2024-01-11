import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyerTopTenComponent } from './flyer-top-ten.component';

describe('FlyerTopTenComponent', () => {
  let component: FlyerTopTenComponent;
  let fixture: ComponentFixture<FlyerTopTenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlyerTopTenComponent]
    });
    fixture = TestBed.createComponent(FlyerTopTenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
