import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TableComponent } from '@components/table/table.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { TableColumnCellTemplateDirective } from '@directives/table-column-cell-template.directive';
import { TableColumnHeaderTemplateDirective } from '@directives/table-column-header-template.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { CriteriaType } from '@enums/criteria-type';
import { GeneralSecretariatTransaction } from '@models/general-secretariat-transaction';
import { Lookup } from '@models/lookup';
import { CsvService } from '@services/csv.service';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';
import { finalize, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-general-secretariat-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    TableComponent,
    TableColumnTemplateDirective,
    TableColumnHeaderTemplateDirective,
    TableColumnCellTemplateDirective,
    IconButtonComponent,
    ButtonComponent,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './general-secretariat-page.component.html',
  styleUrl: './general-secretariat-page.component.scss',
})
export default class GeneralSecretariatPageComponent {
  @ViewChild('detailsTemplate') descriptionTemplate!: TemplateRef<any>;

  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  dashboardService = inject(DashboardService);
  dialog = inject(DialogService);
  sectionTitle = inject(SectionTitleService);
  csvService = inject(CsvService);

  municipalities = this.lookupService.rentLookups.municipalityList;
  propertyTypes = this.lookupService.rentLookups.propertyTypeList;
  propertyUsages = this.lookupService.rentLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  zones = this.lookupService.rentLookups.zoneList;
  rooms = this.lookupService.rentLookups.rooms;
  furnitureStatusList = this.lookupService.rentLookups.furnitureStatusList;
  paramsRange = this.lookupService.rentLookups.maxParams;

  criteria = {} as {
    criteria: CriteriaContract;
    type: CriteriaType;
  };

  isLoadingDownloadList = false;

  readonly _occupationMap: Record<number, Lookup> = {
    1: new Lookup().clone<Lookup>({
      arName: 'مشغول',
      enName: 'Occupied',
    }),
    2: new Lookup().clone<Lookup>({
      arName: 'شاغر',
      enName: 'Vacant',
    }),
    3: new Lookup().clone<Lookup>({
      arName: 'ليس في كهرماء',
      enName: 'Not in Kahramaa',
    }),
    4: new Lookup().clone<Lookup>({
      arName: 'لايوجد رقم كهرباء',
      enName: 'No Electricity_NO',
    }),
  };

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: { ...criteria, limit: 5 }, type };
  }

  getTransactionType = () => GeneralSecretariatTransaction;

  transactionsLoadFn = (criteria: CriteriaContract) =>
    this.dashboardService.loadGeneralSecretariatTransactions(criteria);

  downloadReport = () => {
    if (this.isLoadingDownloadList) return;

    this.isLoadingDownloadList = true;

    let _downloadCriteria: CriteriaContract = {
      ...this.criteria.criteria,
      limit: 1,
      offset: 0,
      issueDateEndMonth: 12,
      issueDateQuarterList: [1, 2, 3, 4],
      issueDateStartMonth: 1,
    };

    this.dashboardService
      .loadGeneralSecretariatTransactions(_downloadCriteria)
      .pipe(
        switchMap((data) => {
          _downloadCriteria = { ..._downloadCriteria, limit: data.count };
          return this.dashboardService.loadGeneralSecretariatTransactions(_downloadCriteria);
        })
      )
      .pipe(take(1))
      .pipe(finalize(() => (this.isLoadingDownloadList = false)))
      .subscribe((data) => {
        const report = data.transactionList;
        const csvData = this.csvService.arrayToCsv(report, [
          { key: 'municipalityInfo', mapTo: this.lang.map.municipal, isLookup: true },
          { key: 'zoneInfo', mapTo: this.lang.map.zone, isLookup: true },
          { key: 'streetNo', mapTo: this.lang.map.street },
          { key: 'buildingNo', mapTo: this.lang.map.building_number },
          { key: 'purposeInfo', mapTo: this.lang.map.purpose, isLookup: true },
          { key: 'propertyTypeInfo', mapTo: this.lang.map.property_type, isLookup: true },
          { key: 'pinNo', mapTo: this.lang.map.pin_no },
          { key: 'electricityNo', mapTo: this.lang.map.electricity_number },
          { key: 'waterNo', mapTo: this.lang.map.water_number },
          { key: 'propertyDescription', mapTo: this.lang.map.property_description },
          { key: 'subUnitCount', mapTo: this.lang.map.sub_unit_count },
          { key: 'area', mapTo: this.lang.map.area_in_square_foot },
          { key: 'bedRoomsCount', mapTo: this.lang.map.bed_rooms },
          { key: 'furnitureInfo', mapTo: this.lang.map.furniture_status, isLookup: true },
          { key: 'rentPaymentAmount', mapTo: this.lang.map.total_rent_value },
          { key: 'rentPaymentFrequency', mapTo: this.lang.map.payment_frequency + ' (' + this.lang.map.a_month + ')' },
          { key: 'certificateCode', mapTo: this.lang.map.transaction_code },
          { key: 'issueDate', mapTo: this.lang.map.documentation_date },
          { key: 'startDate', mapTo: this.lang.map.contract_start_date },
          { key: 'endDate', mapTo: this.lang.map.contract_end_date },
          { key: 'occupancyStatus', mapTo: this.lang.map.occupancy_status },
        ]);

        this.csvService.downloadCsvFile(
          this.lang.map.general_secretariat_report + ' ' + this.getCriteriaSectionTitle(),
          csvData
        );
      });
  };

  openPropertyDescription(description: string) {
    this.dialog.open(this.descriptionTemplate, { data: { description } });
  }

  getCriteriaSectionTitle(): string {
    return this.sectionTitle.getSelectedCriteria('rent', this.criteria.criteria, true, false, true, true, false, true);
  }
}
