import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ChatResponseContract, ChatResponseFormat } from '@contracts/chat-message-contract';
import { AppTableDataSource } from '@models/app-table-data-source';
import { CsvService } from '@services/csv.service';
import { TranslationService } from '@services/translation.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-chat-gpt-data-view',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './chat-gpt-data-view.component.html',
  styleUrl: './chat-gpt-data-view.component.scss',
})
export class ChatGptDataViewComponent implements OnInit {
  @Input({ required: true }) data: ChatResponseContract = { responseFormat: ChatResponseFormat.TABLE, response: [] };
  @Input({ required: true }) question!: string;

  lang = inject(TranslationService);
  csvService = inject(CsvService);

  format = this.data.responseFormat;
  isDataAvailable = false;
  columnNames: string[] = [];

  private _data$ = new BehaviorSubject<Record<string, number | string>[]>([]);
  dataSource = new AppTableDataSource(this._data$);

  ngOnInit(): void {
    if (!this.data) return;
    if (this.data.response.length) {
      this.isDataAvailable = true;
      this.columnNames = Object.keys(this.data.response[0]);
      this.format = this.columnNames.length > 2 ? ChatResponseFormat.TABLE : this.data.responseFormat;
      this._data$.next(this.data.response);
    }
  }

  getMinWidth() {
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
}
