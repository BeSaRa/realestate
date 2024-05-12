import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { IndicatorsRoutes } from '@enums/indicators-routes';
import { SqUnit } from '@enums/sq-unit';
import { CriteriaToLangKey } from '@models/criteria-specific-terms';
import { UserWishList } from '@models/user-wish-list';
import { DialogService } from '@services/dialog.service';
import { CriteriaToLookup, FavouritesService, indicatorRouteToType } from '@services/favourites.service';
import { TranslationService } from '@services/translation.service';
import { UnitsService } from '@services/units.service';
import { isArray } from '@utils/utils';

@Component({
  selector: 'app-favorite-details-popup',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconButtonComponent,
    MatDialogModule,
    InputComponent,
    SelectInputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './favorite-details-popup.component.html',
  styleUrl: './favorite-details-popup.component.scss',
})
export class FavoriteDetailsPopupComponent implements OnInit {
  item = inject<UserWishList>(MAT_DIALOG_DATA);
  lang = inject(TranslationService);
  favouritesService = inject(FavouritesService);
  adapter = inject(DateAdapter);
  unitsService = inject(UnitsService);
  dialog = inject(DialogService);
  dialogRef = inject(DialogRef);
  router = inject(Router);

  months: { label: string; value: number }[] = [];

  allCriteriaKeys = Object.keys(CriteriaToLangKey) as unknown as (keyof CriteriaContract)[];

  ngOnInit(): void {
    this._setMonths();
  }

  applyItem() {
    this.favouritesService.applyCriteria(this.item.criteria, this.item.pageName as unknown as IndicatorsRoutes);
    this.dialog.closeAll();
  }

  hasKey(key: keyof CriteriaContract) {
    return Object.hasOwn(this.item.criteria, key);
  }

  hasLookup(key: keyof CriteriaContract) {
    return !!CriteriaToLookup[key];
  }

  getLabel(key: keyof CriteriaContract) {
    return this.lang.map[CriteriaToLangKey[key]];
  }

  getValue(key: keyof CriteriaContract) {
    if (key === ('issueDateYear' as keyof CriteriaContract)) {
      return this.item.criteria['issueDateYear' as keyof CriteriaContract]?.toString();
    }
    if (key === ('issueDateMonth' as keyof CriteriaContract)) {
      return this.months.find((m) => m.value === this.item.criteria['issueDateMonth' as keyof CriteriaContract])?.label;
    }
    if (key === ('unit' as keyof CriteriaContract)) {
      return this.unitsService.unitsMap[this.item.criteria['unit' as keyof CriteriaContract] as SqUnit]?.getNames();
    }
    if (CriteriaToLookup[key]) {
      const lookupsMap = this.favouritesService.getLookupsMap(
        indicatorRouteToType[this.item.pageName as IndicatorsRoutes],
        key
      );
      if (!lookupsMap) {
        this.router.navigate([this.item.pageName]);
        this.dialogRef.close();
      }
      if (isArray(this.item.criteria[key])) {
        let _value = '';
        const _array = (this.item.criteria[key] as Array<number>) ?? [];
        const _count = _array.length;
        _array.forEach((c, i) => {
          _value += lookupsMap?.[c as number]?.getNames();
          i !== _count - 1 && (_value += ', ');
        });
        return _value;
      } else {
        return lookupsMap?.[this.item.criteria[key] as number]?.getNames();
      }
    } else {
      return this.item.criteria[key]?.toString();
    }
  }

  private _setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));
  }
}
