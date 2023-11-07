import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TransactionsMeasuringListComponent } from '@components/transactions-measuring-list/transactions-measuring-list.component';
import { TranslationService } from '@services/translation.service';
import { KpiRoot } from '@models/kpi-root';
import { KpiRootComponent } from '@components/kpi-root/kpi-root.component';

@Component({
  selector: 'app-rental-transactions-measuring',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TransactionsMeasuringListComponent, KpiRootComponent],
  templateUrl: './rental-transactions-measuring.component.html',
  styleUrls: ['./rental-transactions-measuring.component.scss'],
})
export class RentalTransactionsMeasuringComponent implements OnInit {
  ngOnInit(): void {}
  lang = inject(TranslationService);

  @Input()
  priceList!: KpiRoot[];
  @Input()
  nonePriceList!: KpiRoot[];
}
