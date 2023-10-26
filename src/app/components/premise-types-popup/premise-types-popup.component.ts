import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@components/button/button.component';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { Lookup } from '@models/lookup';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslationService } from '@services/translation.service';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';

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

  premiseTypesData: { title: string; types: Lookup[] } = inject(MAT_DIALOG_DATA);
}
