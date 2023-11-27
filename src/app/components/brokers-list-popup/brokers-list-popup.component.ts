import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrokerComponent } from '@components/broker/broker.component';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Broker } from '@models/broker';
import { TranslationService } from '@services/translation.service';
import { debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-brokers-list-popup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconButtonComponent,
    BrokerComponent,
    ButtonComponent,
    InputComponent,
    MatIconModule,
  ],
  templateUrl: './brokers-list-popup.component.html',
  styleUrls: ['./brokers-list-popup.component.scss'],
})
export class BrokersListPopupComponent extends OnDestroyMixin(class {}) implements OnInit {
  lang = inject(TranslationService);
  ref = inject(MatDialogRef);

  data: { title: string; brokers: Broker[] } = inject(MAT_DIALOG_DATA);

  brokerNameControl = new FormControl('');

  filteredBrokers = this.data.brokers;

  brokerNameFilter = '';

  ngOnInit(): void {
    this.brokerNameControl.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe((value) => {
      this.brokerNameFilter = value ?? '';
      this.filteredBrokers = this.data.brokers.filter((b) => b.validateFilter(value ?? ''));
    });
  }
}
