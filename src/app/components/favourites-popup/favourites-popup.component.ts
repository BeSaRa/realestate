import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@components/button/button.component';
import { FavoriteDetailsPopupComponent } from '@components/favorite-details-popup/favorite-details-popup.component';
import { FavouriteSavePopupComponent } from '@components/favourite-save-popup/favourite-save-popup.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { IndicatorsRoutes, IndicatorsRoutesToLangKey } from '@enums/indicators-routes';
import { UserClick } from '@enums/user-click';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { OperationType, UserWishList, UserWishListResponse } from '@models/user-wish-list';
import { DialogService } from '@services/dialog.service';
import { FavouritesService } from '@services/favourites.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { catchError, finalize, of, switchMap, take, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-favourites-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    IconButtonComponent,
    ButtonComponent,
    MatProgressBarModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './favourites-popup.component.html',
  styleUrl: './favourites-popup.component.scss',
})
export class FavouritesPopupComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  favouriteService = inject(FavouritesService);
  toast = inject(ToastService);
  dialog = inject(DialogService);
  dialogRef = inject(DialogRef);

  wishlist: { filters: UserWishList[]; kpis: UserWishList[] } = { filters: [], kpis: [] };

  isLoading = true;

  ngOnInit(): void {
    this.loadUserWishlist();
  }

  loadUserWishlist() {
    this.favouriteService
      .loadUserWishlist()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.toast.error(this.lang.map.error_occured_when_loading);
          return throwError(() => err);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((wishlist) => (this.wishlist = wishlist));
  }

  getPageName(item: UserWishList) {
    return this.lang.map[IndicatorsRoutesToLangKey[item.pageName as unknown as IndicatorsRoutes]];
  }

  openItemDetails(item: UserWishList) {
    this.dialog.open(FavoriteDetailsPopupComponent, {
      data: item,
      minWidth: '40vw',
      maxWidth: '95vw',
      maxHeight: '95vh',
    });
  }

  applyItem(item: UserWishList, event: MouseEvent) {
    event.stopPropagation();
    this.favouriteService.applyCriteria(item.criteria, item.pageName as unknown as IndicatorsRoutes);
    this.dialogRef.close();
  }

  deleteItem(item: UserWishList, event: MouseEvent) {
    event.stopPropagation();
    this.dialog
      .confirm(this.lang.map.are_you_sure_you_want_delete_item_from_wishlist, this.lang.map.deleting_item, {
        yes: this.lang.map.yes,
        no: this.lang.map.no,
      })
      .afterClosed()
      .pipe(
        take(1),
        switchMap((userClick) => {
          this.isLoading = true;
          if (userClick && userClick === UserClick.YES) return this.favouriteService.deleteItemFromWishlist(item);
          return of(false);
        }),
        catchError((err) => {
          this.toast.error(this.lang.map.error_occured_when_deleting);
          return throwError(() => err);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((isDeleted) => {
        if (isDeleted) {
          this.wishlist.filters = this.wishlist.filters.filter((_item) => _item.id !== item.id);
          this.wishlist.kpis = this.wishlist.kpis.filter((_item) => _item.id !== item.id);
        }
      });
  }

  updateItem(item: UserWishList, event: MouseEvent) {
    event.stopPropagation();
    this.dialog
      .open<unknown, unknown, UserWishListResponse>(FavouriteSavePopupComponent, {
        data: { opType: OperationType.EDIT, wishlist: item },
        maxWidth: '95vw',
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.loadUserWishlist();
      });
  }
}
