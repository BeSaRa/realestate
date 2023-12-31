import { Component, HostListener, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Broker } from '@models/broker';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { HighlightPipe } from '@pipes/highlight.pipe';
import { DialogService } from '@services/dialog.service';
import { BrokerDetailsPopupComponent } from '@components/broker-details-popup/broker-details-popup.component';

@Component({
  selector: 'app-broker',
  standalone: true,
  imports: [CommonModule, HighlightPipe],
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.scss'],
})
export class BrokerComponent {
  @Input({ required: true }) broker!: Broker;
  @Input() filterText = '';

  lang = inject(TranslationService);
  lookupService = inject(LookupService);
  dialog = inject(DialogService);

  @HostListener('click') showBrokerDetails() {
    this.dialog.open(BrokerDetailsPopupComponent, { data: this.broker, maxWidth: '95vw', minWidth: '50vw' });
  }

  getMunicipalityName() {
    return this.lookupService.ovMunicipalitiesMap[this.broker.municipalityId].getNames();
  }
}
