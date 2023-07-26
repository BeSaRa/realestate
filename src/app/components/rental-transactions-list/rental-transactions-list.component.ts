import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { TableComponent } from '@components/table/table.component';
import { DisplayedColumnContract } from '@contracts/displayed-column-contract';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { ButtonComponent } from '@components/button/button.component';

@Component({
  selector: 'app-rental-transactions-list',
  standalone: true,
  imports: [CommonModule, TableComponent, TableColumnTemplateDirective, ButtonComponent],
  templateUrl: './rental-transactions-list.component.html',
  styleUrls: ['./rental-transactions-list.component.scss'],
})
export class RentalTransactionsListComponent {
  lang = inject(TranslationService);

  tableData = [
    {
      city: 'لوسيل',
      details: ['2 غرفة', '1224 قدم مربع'],
      price: '15000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'جزيرة اللؤلؤة',
      details: ['3 غرفة', '1524 قدم مربع'],
      price: '14000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'مشيرب',
      details: ['4 غرفة', '2024 قدم مربع'],
      price: '13000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'الوكرة',
      details: ['2 غرفة', '1224 قدم مربع'],
      price: '11290',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'الخور',
      details: ['3 غرفة', '1634 قدم مربع'],
      price: '8000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'الوكرة 1',
      details: ['2 غرفة', '1224 قدم مربع'],
      price: '11290',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'لوسيل 1',
      details: ['2 غرفة', '1224 قدم مربع'],
      price: '15000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'مشيرب 1',
      details: ['4 غرفة', '2024 قدم مربع'],
      price: '13000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'الخور 1',
      details: ['3 غرفة', '1634 قدم مربع'],
      price: '8000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'جزيرة اللؤلؤة 1',
      details: ['3 غرفة', '1524 قدم مربع'],
      price: '14000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
    {
      city: 'مشيرب 2',
      details: ['4 غرفة', '2024 قدم مربع'],
      price: '13000',
      startDate: '18-6-2020',
      endDate: '18-6-2021',
    },
  ];

  displayedColumns: DisplayedColumnContract[] = [
    { columnName: 'city', columnHeader: 'المدينة \\ المنطقة العقارية' },
    { columnName: 'details', columnHeader: 'تفاصيل العقار \\ الوحدة' },
    { columnName: 'price', columnHeader: 'قيمة الإيجار' },
    { columnName: 'startDate', columnHeader: 'تاريخ بداية العقد' },
    { columnName: 'endDate', columnHeader: 'تاريخ نهاية العقد' },
  ];
}
