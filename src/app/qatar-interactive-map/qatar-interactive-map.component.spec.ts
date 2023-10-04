import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QatarInteractiveMapComponent } from './qatar-interactive-map.component';

describe('QatarInteractiveMapComponent', () => {
  let component: QatarInteractiveMapComponent;
  let fixture: ComponentFixture<QatarInteractiveMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QatarInteractiveMapComponent]
    });
    fixture = TestBed.createComponent(QatarInteractiveMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
