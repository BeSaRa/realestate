import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Broker } from '@models/broker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-broker-details-popup',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, ButtonComponent],
  templateUrl: './broker-details-popup.component.html',
  styleUrls: ['./broker-details-popup.component.scss'],
})
export class BrokerDetailsPopupComponent {
  lang = inject(TranslationService);
  brokerData: Broker = inject(MAT_DIALOG_DATA);
  ref = inject(MatDialogRef);

  get href() {
    return `https://geoportal.gisqatar.org.qa/inwani/index.html?zone=${this.brokerData.zoneNo}&street=${this.brokerData.streetNo}&building=${this.brokerData.buuildingNo}`;
  }
}
