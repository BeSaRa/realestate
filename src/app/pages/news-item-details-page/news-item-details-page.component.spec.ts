import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsItemDetailsPageComponent } from './news-item-details-page.component';

describe('NewsItemDetailsPageComponent', () => {
  let component: NewsItemDetailsPageComponent;
  let fixture: ComponentFixture<NewsItemDetailsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewsItemDetailsPageComponent]
    });
    fixture = TestBed.createComponent(NewsItemDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
