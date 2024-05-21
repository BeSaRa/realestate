import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@components/button/button.component';
import { FavoriteDetailsPopupComponent } from '@components/favorite-details-popup/favorite-details-popup.component';
import { FavouriteSavePopupComponent } from '@components/favourite-save-popup/favourite-save-popup.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { AppIcons } from '@constants/app-icons';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { IndicatorsRoutes, IndicatorsRoutesToLangKey } from '@enums/indicators-routes';
import { UserClick } from '@enums/user-click';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { OperationType, UserWishList, UserWishListResponse } from '@models/user-wish-list';
import { HighlightPipe } from '@pipes/highlight.pipe';
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
    InputComponent,
    SelectInputComponent,
    MatIconModule,
    InputSuffixDirective,
    HighlightPipe,
    ReactiveFormsModule,
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

  wishlist: UserWishList[] = [];
  filteredWishlist = this.wishlist;

  isLoading = false;

  search = inject(FormBuilder).group({
    name: '',
    page: undefined,
  });

  searchName = '';

  pagesOptions = this._initPagesOptions();

  readonly AppIcons = AppIcons;

  ngOnInit(): void {
    this.loadUserWishlist();
    this._listenToSearchChange();
  }

  loadUserWishlist() {
    this.isLoading = true;
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
      .subscribe((wishlist) => {
        this.wishlist = wishlist;
        this.setFilteredWishlist();
      });
  }

  private _listenToSearchChange() {
    this.search.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.searchName = value.name ?? '';
      this.setFilteredWishlist();
    });
  }

  setFilteredWishlist() {
    this.filteredWishlist = this.wishlist
      .filter((item) => !this.search.value.name || item.name.includes(this.search.value.name))
      .filter((item) => !this.search.value.page || item.pageName === this.search.value.page);
  }

  private _initPagesOptions() {
    const _pages = Object.keys(IndicatorsRoutesToLangKey)
      .filter((key) => key !== IndicatorsRoutes.FORECASTING)
      .map((key) => ({
        key,
        pageName: this.lang.map[IndicatorsRoutesToLangKey[key as unknown as IndicatorsRoutes]],
      }));
    _pages.unshift({ key: undefined as unknown as string, pageName: this.lang.map.all });
    return _pages;
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
          this.wishlist = this.wishlist.filter((_item) => _item.id !== item.id);
          this.setFilteredWishlist();
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
