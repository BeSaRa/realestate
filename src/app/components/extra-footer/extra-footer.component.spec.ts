import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraFooterComponent } from './extra-footer.component';

describe('ExtraFooterComponent', () => {
  let component: ExtraFooterComponent;
  let fixture: ComponentFixture<ExtraFooterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ExtraFooterComponent],
    });
    fixture = TestBed.createComponent(ExtraFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
