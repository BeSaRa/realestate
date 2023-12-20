import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurposeListComponent } from './purpose-list.component';

describe('PurposeListComponent', () => {
  let component: PurposeListComponent;
  let fixture: ComponentFixture<PurposeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PurposeListComponent]
    });
    fixture = TestBed.createComponent(PurposeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
