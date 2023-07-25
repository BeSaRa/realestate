import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { TransactionsMeasuringContract } from '@contracts/transactions-measuring-contract';
import { TransactionsMeasuringListComponent } from '@components/transactions-measuring-list/transactions-measuring-list.component';

@Component({
  selector: 'app-rental-contracts',
  standalone: true,
  imports: [CommonModule, TransactionsMeasuringListComponent],
  templateUrl: './rental-contracts.component.html',
  styleUrls: ['./rental-contracts.component.scss'],
})
export class RentalContractsComponent {
  lang = inject(TranslationService);

  rentalContractsList: TransactionsMeasuringContract[] = [
    { title: 'سكني', value: 23849, relativeChange: 0.05, isPriceless: true },
    { title: 'سكني', value: 10758, relativeChange: -0.05, isPriceless: true },
    { title: 'صناعي', value: 785, relativeChange: 0.05, isPriceless: true },
    { title: 'مختلط', value: 642, relativeChange: -0.05, isPriceless: true },
    { title: 'أخرى', value: 962, relativeChange: 0.05, isPriceless: true },
    { title: 'الكل', value: 36864, relativeChange: -0.05, isPriceless: true },
  ];

  realestateTypeContractsList: TransactionsMeasuringContract[] = [
    {
      title: 'أرض',
      value: 123,
      relativeChange: 0.05,
      isPriceless: true,
      imageUrl: 'assets/images/rental-images/land.png',
    },
    {
      title: 'فيلا',
      value: 109,
      relativeChange: -0.05,
      isPriceless: true,
      imageUrl: 'assets/images/rental-images/villa.png',
    },
    {
      title: 'شقة',
      value: 75,
      relativeChange: 0.05,
      isPriceless: true,
      imageUrl: 'assets/images/rental-images/department.png',
    },
    {
      title: 'عمارة',
      value: 67,
      relativeChange: -0.05,
      isPriceless: true,
      imageUrl: 'assets/images/rental-images/building.png',
    },
  ];
}
