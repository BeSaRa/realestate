import { CommonModule, DatePipe } from '@angular/common';
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
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { ExcelService } from '@services/excel.service';
import { LookupService } from '@services/lookup.service';
import { SectionTitleService } from '@services/section-title.service';
import { TranslationService } from '@services/translation.service';

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
  providers: [DatePipe],
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
  excelService = inject(ExcelService);
  datePipe = inject(DatePipe);

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

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = { criteria: { ...criteria, limit: 5 }, type };
  }

  getTransactionType = () => GeneralSecretariatTransaction;

  transactionsLoadFn = (criteria: CriteriaContract) =>
    this.dashboardService.loadGeneralSecretariatTransactions(criteria);

  // downloadReport = () => {
  //   if (this.isLoadingDownloadList) return;

  //   this.isLoadingDownloadList = true;

  //   let _downloadCriteria: CriteriaContract = {
  //     ...this.criteria.criteria,
  //     limit: 1,
  //     offset: 0,
  //     issueDateEndMonth: 12,
  //     issueDateQuarterList: [1, 2, 3, 4],
  //     issueDateStartMonth: 1,
  //   };

  //   this.dashboardService
  //     .loadGeneralSecretariatTransactions(_downloadCriteria)
  //     .pipe(
  //       switchMap((data) => {
  //         _downloadCriteria = { ..._downloadCriteria, limit: data.count };
  //         return this.dashboardService.loadGeneralSecretariatTransactions(_downloadCriteria);
  //       })
  //     )
  //     .pipe(take(1))
  //     .pipe(finalize(() => (this.isLoadingDownloadList = false)))
  //     .pipe(
  //       tap((data) => {
  //         data.transactionList.forEach((item) => {
  //           item.startDate =
  //             this.datePipe.transform(item.startDate, 'YYY-MM-dd', undefined, this.lang.getCurrent().code) ?? '';
  //           item.endDate =
  //             this.datePipe.transform(item.endDate, 'YYY-MM-dd', undefined, this.lang.getCurrent().code) ?? '';
  //           item.issueDate =
  //             this.datePipe.transform(item.issueDate, 'YYY-MM-dd', undefined, this.lang.getCurrent().code) ?? '';
  //         });
  //       })
  //     )
  //     .subscribe((data) => {
  //       this.excelService.downloadExcelFile(
  //         data.transactionList,
  //         this.lang.map.general_secretariat_report + ' ' + this.getCriteriaSectionTitle()
  //       );
  //     });
  // };

  openPropertyDescription(description: string) {
    this.dialog.open(this.descriptionTemplate, { data: { description } });
  }

  getCriteriaSectionTitle(): string {
    return this.sectionTitle.getSelectedCriteria('rent', this.criteria.criteria, true, false, true, true, false, true);
  }
}
