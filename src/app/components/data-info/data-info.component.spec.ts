import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataInfoComponent } from './data-info.component';

describe('DataInfoComponent', () => {
  let component: DataInfoComponent;
  let fixture: ComponentFixture<DataInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DataInfoComponent]
    });
    fixture = TestBed.createComponent(DataInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
