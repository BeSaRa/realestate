import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoyIndicatorComponent } from './yoy-indicator.component';

describe('YoyIndicatorComponent', () => {
  let component: YoyIndicatorComponent;
  let fixture: ComponentFixture<YoyIndicatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [YoyIndicatorComponent],
    });
    fixture = TestBed.createComponent(YoyIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
