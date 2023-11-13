import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BrokerDetailsPopupComponent } from '@components/broker-details-popup/broker-details-popup.component';
import { BrokerComponent } from '@components/broker/broker.component';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { Broker } from '@models/broker';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpi-root';
import { DialogService } from '@services/dialog.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-broker-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    BrokerComponent,
    KpiRootComponent,
    ButtonComponent,
  ],
  templateUrl: './broker-indicators-page.component.html',
  styleUrls: ['./broker-indicators-page.component.scss'],
})
export default class BrokerIndicatorsPageComponent {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.sellLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  // zones = this.lookupService.sellLookups.zoneList;
  rooms = [] /*this.lookupService.sellLookups.rooms*/;
  paramsRange = this.lookupService.sellLookups.maxParams;

  totalBrokers = new KpiRoot().clone<KpiRoot>({
    arName: this.lang.getArabicTranslation('total_number_of_licensed_brokers'),
    enName: this.lang.getEnglishTranslation('total_number_of_licensed_brokers'),
    kpiData: new KpiModel().clone<KpiModel>({ kpiVal: 500 }),
    iconUrl: 'assets/icons/broker/1.svg',
  });

  brokers = [
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      municipalityId: 4,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
  ];

  showBrokerDetails(broker: Broker) {
    this.dialog.open(BrokerDetailsPopupComponent, { data: broker, maxWidth: '95vw', minWidth: '60vw' });
  }
}
