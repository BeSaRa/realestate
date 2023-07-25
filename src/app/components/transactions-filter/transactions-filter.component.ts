import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslationService } from '@services/translation.service';
import { ButtonComponent } from '@components/button/button.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';

@Component({
  selector: 'app-transactions-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, SelectInputComponent],
  templateUrl: './transactions-filter.component.html',
  styleUrls: ['./transactions-filter.component.scss'],
})
export class TransactionsFilterComponent {
  lang = inject(TranslationService);
  fb = inject(FormBuilder);

  municipalOptions = ['الدوحة', 'الدوحة 1', 'الدوحة 2'];
  realestateAreaOptions = ['جزيرة اللؤلؤة', 'جزيرة اللؤلؤة 1', 'جزيرة اللؤلؤة 2'];
  realestateTypeOptions = ['فيلا', 'فيلا 1', 'فيلا 2'];
  realestateUseOptions = ['سكني', 'سكني 1', 'سكني 2'];
  numberOfRoomsOptions = ['غرفتين', 'غرفتين 1', 'غرفتين 2'];
  durationOptions = ['سنوي', 'سنوي 1', 'سنوي 2'];

  filtersForm = this.fb.nonNullable.group({
    municipal: this.municipalOptions[0],
    realestateArea: this.realestateAreaOptions[0],
    realestateType: this.realestateTypeOptions[0],
    realestateUse: this.realestateUseOptions[0],
    numberOfRooms: this.numberOfRoomsOptions[0],
    duration: this.durationOptions[0],
  });
}
