import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Broker } from '@models/broker';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-broker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss'],
})
export class BrokerComponent {
  @Input({ required: true }) broker!: Broker;

  lang = inject(TranslationService);
  lookupService = inject(LookupService);

  getMunicipalityName() {
    return this.lookupService.sellMunicipalitiesMap[this.broker.municipalityId].getNames();
  }
}
