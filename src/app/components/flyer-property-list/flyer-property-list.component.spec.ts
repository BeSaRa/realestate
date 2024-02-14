import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyerPropertyListComponent } from './flyer-property-list.component';

describe('FlyerPropertyListComponent', () => {
  let component: FlyerPropertyListComponent;
  let fixture: ComponentFixture<FlyerPropertyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyerPropertyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlyerPropertyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
