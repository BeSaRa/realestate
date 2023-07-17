import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawDetailsPageComponent } from './law-details-page.component';

describe('LawDetailsPageComponent', () => {
  let component: LawDetailsPageComponent;
  let fixture: ComponentFixture<LawDetailsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LawDetailsPageComponent]
    });
    fixture = TestBed.createComponent(LawDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
