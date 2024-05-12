import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { OperationType, UserWishList, UserWishListResponse } from '@models/user-wish-list';
import { FavouritesService } from '@services/favourites.service';
import { ToastService } from '@services/toast.service';
import { TranslationService } from '@services/translation.service';
import { CustomValidators } from '@validators/custom-validators';
import { catchError, finalize, take, throwError } from 'rxjs';

export interface CriteriaSaveDataContract {
  criteria: CriteriaContract;
  type: 'criteria' | 'kpi';
}

@Component({
  selector: 'app-favourite-save-popup',
  standalone: true,
  imports: [
    CommonModule,
    IconButtonComponent,
    ButtonComponent,
    MatDialogModule,
    InputComponent,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './favourite-save-popup.component.html',
  styleUrl: './favourite-save-popup.component.scss',
})
export class FavouriteSavePopupComponent implements OnInit {
  lang = inject(TranslationService);
  favourites = inject(FavouritesService);
  data = inject<CriteriaSaveDataContract & { opType: OperationType; wishlist: UserWishList }>(MAT_DIALOG_DATA);
  router = inject(Router);
  toast = inject(ToastService);
  private dialogRef = inject(DialogRef);

  name = new FormControl('', [CustomValidators.required]);

  isLoading = false;

  ngOnInit(): void {
    if (this.data.opType === OperationType.EDIT && this.data.wishlist?.pageDescription)
      this.name.setValue(this.data.wishlist.pageDescription, { emitEvent: false });
  }

  saveCriteria() {
    if (this.name.invalid || this.isLoading) return;

    this.isLoading = true;

    (this.data.opType !== OperationType.EDIT
      ? this.favourites.saveCriteria(
          new UserWishListResponse().clone<UserWishListResponse>({
            criteria: JSON.stringify(this.data.criteria),
            pageName: this.router.url,
            pageDescription: this.name.value ?? '',
          })
        )
      : this.favourites.updateCriteria({
          ...this.data.wishlist,
          criteria: JSON.stringify(this.data.wishlist.criteria),
          pageDescription: this.name.value ?? '',
        })
    )
      .pipe(
        take(1),
        catchError((err) => {
          this.toast.error(this.lang.map.failed_to_save_options_please_try_again);
          return throwError(() => err);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(() => {
        this.toast.success(this.lang.map.options_saved_successfully);
        this.dialogRef.close();
      });
  }

  getTitle() {
    return this.data.opType === OperationType.EDIT ? this.lang.map.edit_name : this.lang.map.save_options;
  }
}
