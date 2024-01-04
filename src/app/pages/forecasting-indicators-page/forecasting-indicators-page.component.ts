import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ButtonComponent } from '@components/button/button.component';
import { ForecastingChartComponent } from '@components/forecasting-chart/forecasting-chart.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { CriteriaSpecificTerms } from '@models/criteria-specific-terms';
import { Lookup } from '@models/lookup';
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
  ],
  templateUrl: './forecasting-indicators-page.component.html',
  styleUrls: ['./forecasting-indicators-page.component.scss'],
})
export default class ForecastingIndicatorsPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  fb = inject(UntypedFormBuilder);
  lookupService = inject(LookupService);
  urlService = inject(UrlService);

  sellMunicipalities = this.lookupService.sellLookups.municipalityList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );
  sellAreas = this.lookupService.sellLookups.districtList
    .filter((item) => item.lookupKey !== -1 && item.lookupKey)
    .sort((a, b) => a.lookupKey - b.lookupKey);
  sellPropertyUsages = this.lookupService.sellLookups.rentPurposeList
    .filter((item) => item.lookupKey !== -1 && item.lookupKey)
    .sort((a, b) => a.lookupKey - b.lookupKey);
  sellPropertyTypes = this.lookupService.sellLookups.propertyTypeList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );

  rentMunicipalities = this.lookupService.rentLookups.municipalityList.filter(
    (item) => item.lookupKey !== -1 && item.lookupKey
  );
  rentZones = this.lookupService.rentLookups.zoneList
    .filter((item) => item.lookupKey !== -1 && item.lookupKey)
    .sort((a, b) => a.lookupKey - b.lookupKey);
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
    this.setDefaultValues();
    this.listenToFilterChange();
  }

  setDefaultValues() {
    this.sellFilter.patchValue({ municipalityId: 4, areaCode: 765, purposeId: 1, propertyTypeId: 1 });
    this.rentFilter.patchValue({ municipalityId: 1, zoneId: 14, purposeId: 1, propertyTypeId: 39 });
    this.updateCriteria();
  }

  listenToMunicipalityChange() {
    this.sellMunicipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.filteredSellAreas = this.sellAreas.filter((item) => item.municipalityId === value);
      this.sellFilter.get('areaCode')?.patchValue(this.filteredSellAreas[0].lookupKey, { emitEvent: false });
    });
    this.rentMunicipalityId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.filteredRentZones = this.rentZones.filter((item) => item.municipalityId === value);
      this.rentFilter.get('zoneId')?.patchValue(this.filteredRentZones[0].lookupKey, { emitEvent: false });
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
}
