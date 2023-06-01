import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LawItemComponent } from './law-item.component';

describe('LawItemComponent', () => {
  let component: LawItemComponent;
  let fixture: ComponentFixture<LawItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LawItemComponent]
    });
    fixture = TestBed.createComponent(LawItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
