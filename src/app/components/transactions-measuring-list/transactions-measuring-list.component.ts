import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsMeasuringContract } from '@contracts/transactions-measuring-contract';
import { TransactionsMeasuringItemComponent } from '@components/transactions-measuring-item/transactions-measuring-item.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { MatButtonModule } from '@angular/material/button';
import { IvyCarouselModule } from 'angular-responsive-carousel2';

@Component({
  selector: 'app-transactions-measuring-list',
  standalone: true,
  imports: [
    CommonModule,
    TransactionsMeasuringItemComponent,
    IconButtonComponent,
    ButtonComponent,
    MatButtonModule,
    IvyCarouselModule,
  ],
  templateUrl: './transactions-measuring-list.component.html',
  styleUrls: ['./transactions-measuring-list.component.scss'],
})
export class TransactionsMeasuringListComponent {
  @Input({ required: true }) list!: TransactionsMeasuringContract[];
  @Input() type: 'normal' | 'small' | 'carousel' = 'normal';

  lang = inject(TranslationService);
}
