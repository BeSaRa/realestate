import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { KpiPurpose } from '@models/kpi-purpose';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-premise-types-popup',
  standalone: true,
  imports: [CommonModule, PurposeComponent, ButtonComponent, IconButtonComponent],
  templateUrl: './premise-types-popup.component.html',
  styleUrls: ['./premise-types-popup.component.scss'],
})
export class PremiseTypesPopupComponent {
  lang = inject(TranslationService);
  ref = inject(MatDialogRef);

  premiseTypesData: { title: string; types: KpiPurpose[] } = inject(MAT_DIALOG_DATA);
}
