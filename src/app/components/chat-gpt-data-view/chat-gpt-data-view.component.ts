import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ChatResponseContract, ChatResponseFormat } from '@contracts/chat-message-contract';
import { AppTableDataSource } from '@models/app-table-data-source';
import { CsvService } from '@services/csv.service';
import { TranslationService } from '@services/translation.service';
import { formatNumber, minMaxAvg } from '@utils/utils';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-chat-gpt-data-view',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  providers: [DecimalPipe],
  templateUrl: './chat-gpt-data-view.component.html',
  styleUrl: './chat-gpt-data-view.component.scss',
})
export class ChatGptDataViewComponent implements OnInit {
  @Input({ required: true }) data: ChatResponseContract = { responseFormat: ChatResponseFormat.TABLE, response: [] };
  @Input({ required: true }) question!: string;

  lang = inject(TranslationService);
  csvService = inject(CsvService);
  decimalPipe = inject(DecimalPipe);

  isDataAvailable = false;
  columnNames: string[] = [];

  private _data$ = new BehaviorSubject<Record<string, number | string>[]>([]);
  dataSource = new AppTableDataSource(this._data$);

  dataColumnTypes: Record<string, 'value' | 'number' | 'string'> = {};

  minMaxAvg = minMaxAvg([1]);

  readonly Format = ChatResponseFormat;

  get isTableView() {
    return this.data.responseFormat !== ChatResponseFormat.CHART || this.isColumnsCountLarge || this.isAxisUnknown;
  }

  get isColumnsCountLarge() {
    return this.data.responseFormat === ChatResponseFormat.CHART && this.columnNames.length > 2;
  }

  get isAxisUnknown() {
    return this.data.responseFormat === ChatResponseFormat.CHART && (!this.getChartYAxis() || !this.getChartXAxis());
  }

  ngOnInit(): void {
    if (!this.data) return;
    if (this.data.response.length) {
      this.isDataAvailable = true;
      this.columnNames = Object.keys(this.data.response[0]);
      this._data$.next(this.data.response);
      this._setDataColumnsTypes();
      this.data.responseFormat === ChatResponseFormat.CHART && this._initChart();
    }
  }

  getTableMinWidth() {
    let minWidth = 0;
    this.columnNames.forEach((c) => {
      minWidth += c.length * 7 + 16;
    });
    return minWidth + 'px';
  }

  downloadCsvFile() {
    const _csv = this.csvService.arrayToCsv(
      this.data.response,
      Object.keys(this.data.response[0]).map((key) => ({ key, mapTo: key }))
    );
    this.csvService.downloadCsvFile(this.question, _csv);
  }

  getCellValue(cell: string | number, column: string) {
    if (cell === undefined || cell === null) return '---';
    if (
      !this.dataColumnTypes[column] ||
      this.dataColumnTypes[column] === 'string' ||
      this.dataColumnTypes[column] === 'number'
    )
      return cell;

    return this.decimalPipe.transform(cell);
  }

  private _setDataColumnsTypes() {
    Object.keys(this.data.response[0]).forEach((key) => {
      if (typeof this.data.response[0][key] !== 'number') {
        this.dataColumnTypes[key] = 'string';
        return;
      }
      if (this._isNumColumn(key)) {
        this.dataColumnTypes[key] = 'number';
        return;
      }
      this.dataColumnTypes[key] = 'value';
    });
  }

  private _initChart() {
    this._setMinMax();
    if (typeof this.getXValue(0) === 'number') {
      this.data.response.sort((a, b) => (a[this.getChartXAxis()!] as number) - (b[this.getChartXAxis()!] as number));
    }
  }

  private _setMinMax() {
    this.minMaxAvg = minMaxAvg(this.data.response.map((_, i) => this.getYValue(i)));
  }

  private _isNumColumn(col: string) {
    if (col.toLowerCase().includes('num') || col.toLowerCase().includes('number') || col.toLowerCase().includes('رقم'))
      return true;

    const cell = this.data.response[0][col];
    if (
      (this.data.response.every((c) => c[col]?.toString().length === cell?.toString().length) ||
        this.data.response.every(
          (c) => (c[col] as number) > 1970 && (c[col] as number) <= new Date(Date.now()).getFullYear()
        ) ||
        this.data.response.every((c) => (c[col] as number) >= 0 && (c[col] as number) <= this.data.response.length)) &&
      !this.data.response.some((c) => c[col]?.toString().includes('.'))
    )
      return true;

    return false;
  }

  getChartXAxis() {
    return Object.keys(this.dataColumnTypes).find((k) => this.dataColumnTypes[k] === 'number');
  }

  getChartYAxis() {
    if (!this.getChartXAxis()) return undefined;
    return Object.keys(this.dataColumnTypes).find((k) => k !== this.getChartXAxis());
  }

  getYValue(index: number) {
    return (this.getChartYAxis() ? this.data.response[index][this.getChartYAxis()!] : 0) as number;
  }

  getXValue(index: number) {
    return this.getChartXAxis() ? this.data.response[index][this.getChartXAxis()!] : '---';
  }

  getFormattedValue(value: number) {
    return formatNumber(value ?? 0) as string;
  }

  getChartMinWidth() {
    let minWidth = 0;
    this.data.response.forEach((c) => {
      minWidth += 55;
    });
    minWidth -= 24;
    minWidth = Math.max(minWidth, 400);
    return minWidth + 'px';
  }
}
