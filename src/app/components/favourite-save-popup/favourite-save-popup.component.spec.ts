import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavouriteSavePopupComponent } from './favourite-save-popup.component';

describe('FavouriteSavePopupComponent', () => {
  let component: FavouriteSavePopupComponent;
  let fixture: ComponentFixture<FavouriteSavePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavouriteSavePopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FavouriteSavePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
