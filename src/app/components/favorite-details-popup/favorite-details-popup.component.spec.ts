import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteDetailsPopupComponent } from './favorite-details-popup.component';

describe('FavoriteDetailsPopupComponent', () => {
  let component: FavoriteDetailsPopupComponent;
  let fixture: ComponentFixture<FavoriteDetailsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteDetailsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FavoriteDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
