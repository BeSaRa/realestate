import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyerCompositeTableComponent } from './flyer-composite-table.component';

describe('FlyerCompositeTableComponent', () => {
  let component: FlyerCompositeTableComponent;
  let fixture: ComponentFixture<FlyerCompositeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyerCompositeTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlyerCompositeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
