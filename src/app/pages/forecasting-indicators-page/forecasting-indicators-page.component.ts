import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { ForecastingChartComponent } from '@components/forecasting-chart/forecasting-chart.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { CriteriaSpecificTerms } from '@models/criteria-specific-terms';
import { Lookup } from '@models/lookup';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-forecasting-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    SelectInputComponent,
    ReactiveFormsModule,
    ForecastingChartComponent,
    ButtonComponent,
    IconButtonComponent,
    MatDialogModule,
  ],
  templateUrl: './forecasting-indicators-page.component.html',
  styleUrls: ['./forecasting-indicators-page.component.scss'],
})
export default class ForecastingIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('forecastingMethod') forecastingMethodPopupTemplate!: TemplateRef<any>;

  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  urlService = inject(UrlService);
  dialog = inject(DialogService);

  sellMunicipalities = this.lookupService.sellLookups.municipalityList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );
  sellAreas = this.lookupService.sellLookups.districtList;

  sellPropertyUsages = this.lookupService.sellLookups.rentPurposeList
    .filter((item) => item.lookupKey !== -1 && item.lookupKey)
    .sort((a, b) => a.lookupKey - b.lookupKey);
  sellPropertyTypes = this.lookupService.sellLookups.propertyTypeList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );

  rentMunicipalities = this.lookupService.rentLookups.municipalityList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );
  rentZones = this.lookupService.rentLookups.zoneList;

  rentPropertyUsages = this.lookupService.rentLookups.rentPurposeList
    .filter((item) => item.lookupKey !== -1 && item.lookupKey)
    .sort((a, b) => a.lookupKey - b.lookupKey);
  rentPropertyTypes = this.lookupService.rentLookups.propertyTypeList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );

  filteredSellAreas: Lookup[] = [];
  filteredRentZones: Lookup[] = [];

  sellRootData = { chartDataUrl: this.urlService.URLS.SELL_KPI_ML, hasPrice: true };
  rentRootData = { chartDataUrl: this.urlService.URLS.RENT_KPI_ML, hasPrice: true };

  criteria = undefined as unknown as CriteriaContract;

  citeriaTerms = new CriteriaSpecificTerms([]);

  selectedTab: 'sell' | 'rent' = 'sell';

  sellFilter = this.fb.group({ municipalityId: [], areaCode: [], purposeId: [], propertyTypeId: [] });
  rentFilter = this.fb.group({ municipalityId: [], zoneId: [], purposeId: [], propertyTypeId: [] });

  get sellMunicipalityId() {
    return this.sellFilter.get('municipalityId') as AbstractControl;
  }

  get rentMunicipalityId() {
    return this.rentFilter.get('municipalityId') as AbstractControl;
  }

  ngOnInit(): void {
    this.listenToMunicipalityChange();
    this.listenToLangChange();
    this.setDefaultValues();
    this.listenToFilterChange();
  }

  setDefaultValues() {
    this.sellFilter.patchValue({ municipalityId: 4, areaCode: 12, purposeId: 4, propertyTypeId: 1 });
    this.rentFilter.patchValue({ municipalityId: 1, zoneId: 14, purposeId: 1, propertyTypeId: 39 });
    this.updateCriteria();
  }

  listenToMunicipalityChange() {
    this.sellMunicipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.filteredSellAreas = this.sellAreas.filter((item) => item.lookupKey !== -1 && item.municipalityId === value);
      this.sellFilter.get('areaCode')?.patchValue(this.filteredSellAreas[0].lookupKey, { emitEvent: false });
    });
    this.rentMunicipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.filteredRentZones = this.rentZones.filter((item) => item.lookupKey !== -1 && item.municipalityId === value);
      this.rentFilter.get('zoneId')?.patchValue(this.filteredRentZones[0].lookupKey, { emitEvent: false });
    });
  }

  listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.filteredSellAreas = this.sellAreas.filter(
        (item) => item.lookupKey !== -1 && item.municipalityId === this.sellMunicipalityId.value
      );
      this.filteredRentZones = this.rentZones.filter(
        (item) => item.lookupKey !== -1 && item.municipalityId === this.rentMunicipalityId.value
      );
    });
  }

  listenToFilterChange() {
    [this.sellFilter.valueChanges, this.rentFilter.valueChanges].forEach((o) =>
      o.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateCriteria())
    );
  }

  switchTab(tab: 'sell' | 'rent'): void {
    this.selectedTab = tab;
    this.updateCriteria();
  }

  isSelectedTab(tab: 'sell' | 'rent'): boolean {
    return this.selectedTab === tab;
  }

  updateCriteria() {
    this.criteria = this.selectedTab === 'sell' ? this.sellFilter.value : this.rentFilter.value;
  }

  openForecastingMethodInfo() {
    this.dialog.open(this.forecastingMethodPopupTemplate, { maxWidth: '90vw', maxHeight: '90vh' });
  }
}
