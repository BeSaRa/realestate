import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiRootComponent } from './kpi-root.component';

describe('KpiRootComponent', () => {
  let component: KpiRootComponent;
  let fixture: ComponentFixture<KpiRootComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KpiRootComponent],
    });
    fixture = TestBed.createComponent(KpiRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
