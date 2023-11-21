import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslationService } from '@services/translation.service';
import { Broker } from '@models/broker';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { BrokerComponent } from '@components/broker/broker.component';
import { ButtonComponent } from '@components/button/button.component';
import { DialogService } from '@services/dialog.service';
import { BrokerDetailsPopupComponent } from '@components/broker-details-popup/broker-details-popup.component';

@Component({
  selector: 'app-brokers-list-popup',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, BrokerComponent, ButtonComponent],
  templateUrl: './brokers-list-popup.component.html',
  styleUrls: ['./brokers-list-popup.component.scss'],
})
export class BrokersListPopupComponent {
  lang = inject(TranslationService);
  dialog = inject(DialogService);
  ref = inject(MatDialogRef);

  data: { title: string; brokers: Broker[] } = inject(MAT_DIALOG_DATA);

  showBrokerDetails(broker: Broker) {
    this.dialog.open(BrokerDetailsPopupComponent, { data: broker, maxWidth: '95vw', minWidth: '60vw' });
  }
}
