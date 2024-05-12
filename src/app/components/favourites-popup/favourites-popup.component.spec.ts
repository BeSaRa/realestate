import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouritesPopupComponent } from './favourites-popup.component';

describe('FavouritesPopupComponent', () => {
  let component: FavouritesPopupComponent;
  let fixture: ComponentFixture<FavouritesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouritesPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavouritesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
