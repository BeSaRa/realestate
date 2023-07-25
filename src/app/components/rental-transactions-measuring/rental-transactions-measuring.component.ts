import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TransactionsMeasuringListComponent } from '@components/transactions-measuring-list/transactions-measuring-list.component';
import { TransactionsMeasuringContract } from '@contracts/transactions-measuring-contract';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-rental-transactions-measuring',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TransactionsMeasuringListComponent],
  templateUrl: './rental-transactions-measuring.component.html',
  styleUrls: ['./rental-transactions-measuring.component.scss'],
})
export class RentalTransactionsMeasuringComponent {
  lang = inject(TranslationService);

  transactionsList: TransactionsMeasuringContract[] = [
    { title: 'إجمالي عدد عقود الإيجار', value: 36864, relativeChange: 0.05, isPriceless: true },
    { title: 'إجمالي عدد العقارات \\الوحدات\\ المستأجرة', value: 31547, relativeChange: -0.05, isPriceless: true },
    { title: 'إجمالي المساحات المستأجرة', value: 3001, relativeChange: 0.01, isPriceless: true },
    { title: 'متوسط سعر الإيجار \\للوحدة\\ للعقار', value: 10250, relativeChange: 0.022, isPriceless: false },
    { title: 'متوسط سعر الإيجار للمتر \\ القدم المربع', value: 600, relativeChange: 0.05, isPriceless: false },
    { title: 'إجمالي قيمة عقود الإيجار', value: 663, relativeChange: 0.014, isPriceless: false },
  ];

  get pricelessList() {
    return this.transactionsList.filter((t) => t.isPriceless);
  }
  get pricefullList() {
    return this.transactionsList.filter((t) => !t.isPriceless);
  }
}
