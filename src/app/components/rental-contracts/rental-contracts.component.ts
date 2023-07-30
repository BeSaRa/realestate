import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { TransactionsMeasuringListComponent } from '@components/transactions-measuring-list/transactions-measuring-list.component';
import { KpiRoot } from '@models/kpiRoot';

@Component({
  selector: 'app-rental-contracts',
  standalone: true,
  imports: [CommonModule, TransactionsMeasuringListComponent],
  templateUrl: './rental-contracts.component.html',
  styleUrls: ['./rental-contracts.component.scss'],
})
export class RentalContractsComponent {
  lang = inject(TranslationService);

  rentalContractsList: KpiRoot[] = [];

  // realestateTypeContractsList: TransactionsMeasuringContract[] = [
  //   {
  //     title: 'أرض',
  //     value: 123,
  //     relativeChange: 0.05,
  //     isPriceless: true,
  //     imageUrl: 'assets/images/rental-images/land.png',
  //   },
  //   {
  //     title: 'فيلا',
  //     value: 109,
  //     relativeChange: -0.05,
  //     isPriceless: true,
  //     imageUrl: 'assets/images/rental-images/villa.png',
  //   },
  //   {
  //     title: 'شقة',
  //     value: 75,
  //     relativeChange: 0.05,
  //     isPriceless: true,
  //     imageUrl: 'assets/images/rental-images/department.png',
  //   },
  //   {
  //     title: 'عمارة',
  //     value: 67,
  //     relativeChange: -0.05,
  //     isPriceless: true,
  //     imageUrl: 'assets/images/rental-images/building.png',
  //   },
  // ];
}
