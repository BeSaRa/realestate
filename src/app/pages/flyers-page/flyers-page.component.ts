import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { ButtonComponent } from '@components/button/button.component';
import { FlyerCompositeTableComponent } from '@components/flyer-composite-table/flyer-composite-table.component';
import { FlyerPropertyListComponent } from '@components/flyer-property-list/flyer-property-list.component';
import { FlyerSummaryComponent } from '@components/flyer-summary/flyer-summary.component';
import { FlyerTopTenComponent } from '@components/flyer-top-ten/flyer-top-ten.component';
import { PriceRangeComponent } from '@components/price-range/price-range.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { DurationEndpoints } from '@enums/durations';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-flyers-page',
  standalone: true,
  providers: [],
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    FlyerSummaryComponent,
    FlyerTopTenComponent,
    FlyerPropertyListComponent,
    ButtonComponent,
    PriceRangeComponent,
    ReactiveFormsModule,
    MatNativeDateModule,
    SelectInputComponent,
    FlyerCompositeTableComponent,
  ],
  templateUrl: './flyers-page.component.html',
  styleUrls: ['./flyers-page.component.scss'],
})
export default class FlyersPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  adapter = inject(DateAdapter);

  months: { label: string; value: number }[] = [];
  quarterYearDurations = this.lookupService.rentLookups.quarterYearDurations;

  monthControl = new FormControl<number | undefined>(undefined);
  quarterControl = new FormControl<number | undefined>(undefined);

  criteria: FlyerCriteriaContract = {
    issueDateYear: new Date().getFullYear() - 1,
  };

  readonly DurationTypes = DurationEndpoints;
  selectedDurationType = DurationEndpoints.YEARLY;

  isLoading = false;

  propertyTypes = [
    new Lookup().clone<Lookup>({
      enName: 'Land',
      arName: 'أرض',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Villa',
      arName: 'فلل',
      lookupKey: 4,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Residental Complex',
      arName: 'مجمع سكني',
      lookupKey: 5,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Apartment',
      arName: 'شقة',
      lookupKey: 6,
    }),
  ];

  ngOnInit(): void {
    this._setMonths();
    this.listenToMonthChange();
    this.listenToQuarterChange();
    this.listenToLangChange();
  }

  updateDuration(type: DurationEndpoints) {
    this.selectedDurationType = type;

    if (type === DurationEndpoints.YEARLY) {
      this.criteria = { ...this.criteria, issueDateMonth: undefined, issueDateQuarter: undefined };
      this.monthControl.setValue(undefined, { emitEvent: false });
      this.quarterControl.setValue(undefined, { emitEvent: false });
    } else if (type === DurationEndpoints.MONTHLY) {
      this.monthControl.setValue(1, { emitEvent: false });
      this.quarterControl.setValue(undefined, { emitEvent: false });
      this.criteria = { ...this.criteria, issueDateMonth: 1, issueDateQuarter: undefined };
    } else {
      this.monthControl.setValue(undefined, { emitEvent: false });
      this.quarterControl.setValue(1, { emitEvent: false });
      this.criteria = { ...this.criteria, issueDateMonth: undefined, issueDateQuarter: 1 };
    }
  }

  listenToMonthChange() {
    this.monthControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((month) => {
      this.criteria = { ...this.criteria, issueDateMonth: month as number, issueDateQuarter: undefined };
    });
  }

  listenToQuarterChange() {
    this.quarterControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((quarter) => {
      this.criteria = { ...this.criteria, issueDateMonth: undefined, issueDateQuarter: quarter as number };
    });
  }

  listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => this._setMonths());
  }

  private _setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));
  }

  getTitleSuffix() {
    let _suffix = '';
    _suffix += this.lang.map.for_year + ' ' + this.criteria.issueDateYear;
    if (this.criteria.issueDateMonth) _suffix += ' (' + this.months[this.criteria.issueDateMonth - 1].label + ')';
    if (this.criteria.issueDateQuarter)
      _suffix += ' (' + this.quarterYearDurations[this.criteria.issueDateQuarter - 1].getNames() + ')';
    return _suffix;
  }
}
