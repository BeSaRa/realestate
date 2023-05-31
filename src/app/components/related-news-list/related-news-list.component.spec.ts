import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedNewsListComponent } from './related-news-list.component';

describe('RelatedNewsListComponent', () => {
  let component: RelatedNewsListComponent;
  let fixture: ComponentFixture<RelatedNewsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RelatedNewsListComponent]
    });
    fixture = TestBed.createComponent(RelatedNewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
