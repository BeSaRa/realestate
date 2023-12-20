import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrokerComponent } from '@components/broker/broker.component';
import { ButtonComponent } from '@components/button/button.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { CriteriaType } from '@enums/criteria-type';
import { Broker } from '@models/broker';
import { KpiRoot } from '@models/kpi-root';
import { CsvService } from '@services/csv.service';
import { DashboardService } from '@services/dashboard.service';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-broker-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    TransactionsFilterComponent,
    BrokerComponent,
    KpiRootComponent,
    ButtonComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './broker-indicators-page.component.html',
  styleUrls: ['./broker-indicators-page.component.scss'],
})
export default class BrokerIndicatorsPageComponent {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);
  urlService = inject(UrlService);
  dashboardService = inject(DashboardService);
  csvService = inject(CsvService);

  municipalities = this.lookupService.ovLookups.municipalityList;
  brokerCategories = this.lookupService.brokerLookups.brokerCategoryList;

  criteria = {} as {
    criteria: CriteriaContract & { brokerCategoryId: number };
    type: CriteriaType;
  };

  totalBrokers = new KpiRoot().clone<KpiRoot>({
    arName: this.lang.getArabicTranslation('total_number_of_licensed_brokers'),
    enName: this.lang.getEnglishTranslation('total_number_of_licensed_brokers'),
    url: this.urlService.URLS.BROKER_KPI1,
    iconUrl: 'assets/icons/broker/1.svg',
  });

  private currentOffset = 0;
  showMoreEnabled = true;
  visibleBrokersCount = 9;
  brokers: Broker[] = [];
  filteredBrokers = this.brokers;
  brokersCount!: number;
  brokersCountToFetch = 9;
  brokerNameFilter = '';
  isLoadingBrokers = false;

  filterChange({ criteria, type }: { criteria: CriteriaContract; type: CriteriaType }) {
    this.criteria = {
      criteria: { ...criteria, limit: this.brokersCountToFetch, offset: 0 } as CriteriaContract & {
        brokerCategoryId: number;
      },
      type,
    };

    if (type === CriteriaType.DEFAULT) return;

    this.dashboardService
      .loadBrokers(this.criteria.criteria)
      .pipe(take(1))
      .subscribe((brokers) => {
        this.brokers = brokers.transactionList;
        this.filteredBrokers = this.brokers.filter((b) => b.validateFilter(this.brokerNameFilter));
        this.visibleBrokersCount = Math.min(this.filteredBrokers.length, this.brokersCountToFetch);
        this.brokersCount = brokers.count;
      });
  }

  downloadBrokersList() {
    const criteriaForAll = { ...this.criteria.criteria, limit: this.brokersCount };
    delete this.criteria.criteria.limit;
    this.dashboardService
      .loadBrokers(criteriaForAll)
      .pipe(take(1))
      .subscribe((res) => {
        const brokers = res.transactionList;
        const _data = this.csvService.arrayToCsv(brokers, [
          // { key: this.lang.isLtr ? 'managerEnName' : 'managerArName', mapTo: this.lang.map.broker_name },
          { key: this.lang.isLtr ? 'brokerEnName' : 'brokerArName', mapTo: this.lang.map.company_name },
          { key: 'brokerPhone1', mapTo: this.lang.map.phone },
          { key: 'brokerEmail', mapTo: this.lang.map.email },
        ]);

        this.csvService.downloadCsvFile(
          this.lang.map.brokers_list +
            '-' +
            this.lookupService.brokerMunicipalitiesMap[this.criteria.criteria.municipalityId].getNames() +
            '-' +
            new Date(Date.now()).toDateString(),
          _data
        );
      });
  }
  onBrokerNameFilterChanged(name: string) {
    this.showMoreEnabled = name == ''; // to be removed when backend filtering is ready
    this.brokerNameFilter = name;
    this.filteredBrokers = this.brokers.filter((b) => b.validateFilter(name));
  }

  loadMoreBrokers() {
    this.isLoadingBrokers = true;
    this.currentOffset += this.brokersCountToFetch;

    const criteriaWithOffset = { ...this.criteria.criteria, offset: this.currentOffset };

    this.dashboardService
      .loadBrokers(criteriaWithOffset)
      .pipe(take(1))
      .pipe(
        finalize(() => {
          this.isLoadingBrokers = false;
        })
      )
      .subscribe((brokers) => {
        this.brokers.push(...brokers.transactionList);
        this.filteredBrokers = this.brokers.filter((b) => b.validateFilter(this.brokerNameFilter));
      });
    this.visibleBrokersCount += Math.min(this.brokersCountToFetch, this.filteredBrokers.length);
  }
}
