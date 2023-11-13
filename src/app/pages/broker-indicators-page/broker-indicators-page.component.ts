import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { TranslationService } from '@services/translation.service';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { LookupService } from '@services/lookup.service';
import { Broker } from '@models/broker';

@Component({
  selector: 'app-broker-indicators-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent, TransactionsFilterComponent],
  templateUrl: './broker-indicators-page.component.html',
  styleUrls: ['./broker-indicators-page.component.scss'],
})
export default class BrokerIndicatorsPageComponent {
  lang = inject(TranslationService);
  lookupService = inject(LookupService);

  municipalities = this.lookupService.sellLookups.municipalityList;
  propertyTypes = this.lookupService.sellLookups.propertyTypeList;
  propertyUsages = this.lookupService.sellLookups.rentPurposeList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  areas = this.lookupService.sellLookups.districtList.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  // zones = this.lookupService.sellLookups.zoneList;
  rooms = [] /*this.lookupService.sellLookups.rooms*/;
  paramsRange = this.lookupService.sellLookups.maxParams;

  brokers = [
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
    new Broker().clone<Broker>({
      id: 1,
      arName: this.lang.getArabicTranslation('broker_name'),
      enName: this.lang.getEnglishTranslation('broker_name'),
      phone: '44353366',
      email: 'ajag@ajag.com',
    }),
  ];
}
