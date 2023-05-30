import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsListComponent } from './news-list.component';

describe('NewsComponent', () => {
  let component: NewsListComponent;
  let fixture: ComponentFixture<NewsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NewsListComponent],
    });
    fixture = TestBed.createComponent(NewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
