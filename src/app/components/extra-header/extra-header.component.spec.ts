import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraHeaderComponent } from './extra-header.component';

describe('ExtraHeaderComponent', () => {
  let component: ExtraHeaderComponent;
  let fixture: ComponentFixture<ExtraHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExtraHeaderComponent],
    });
    fixture = TestBed.createComponent(ExtraHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
