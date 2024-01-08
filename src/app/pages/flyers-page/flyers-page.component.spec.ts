import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyersPageComponent } from './flyers-page.component';

describe('FlyersPageComponent', () => {
  let component: FlyersPageComponent;
  let fixture: ComponentFixture<FlyersPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FlyersPageComponent]
    });
    fixture = TestBed.createComponent(FlyersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
