import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { TranslationService } from '@services/translation.service';
import { RentalTransactionsMeasuringComponent } from '@components/rental-transactions-measuring/rental-transactions-measuring.component';
import { TransactionsFilterComponent } from '@components/transactions-filter/transactions-filter.component';
import { RentalContractsComponent } from '@components/rental-contracts/rental-contracts.component';
import { RentalTransactionsListComponent } from '@components/rental-transactions-list/rental-transactions-list.component';

@Component({
  selector: 'app-rental-indicators-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    TransactionsFilterComponent,
    RentalTransactionsMeasuringComponent,
    RentalContractsComponent,
    RentalTransactionsListComponent,
  ],
  templateUrl: './rental-indicators-page.component.html',
  styleUrls: ['./rental-indicators-page.component.scss'],
})
export default class RentalIndicatorsPageComponent {
  lang = inject(TranslationService);
}
