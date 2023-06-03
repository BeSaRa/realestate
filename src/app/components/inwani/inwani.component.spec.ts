import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwaniComponent } from './inwani.component';

describe('InwaniComponent', () => {
  let component: InwaniComponent;
  let fixture: ComponentFixture<InwaniComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InwaniComponent],
    });
    fixture = TestBed.createComponent(InwaniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
