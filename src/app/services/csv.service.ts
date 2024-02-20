import { Injectable } from '@angular/core';
import { Lookup } from '@models/lookup';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  arrayToCsv<T>(data: T[], columns: { key: keyof T; mapTo: string; isLookup?: boolean }[]) {
    let csvContent = '';

    columns.forEach((c, i) => {
      csvContent += c.mapTo + (i === columns.length - 1 ? '\r\n' : ',');
    });

    data.forEach((row) => {
      columns.forEach((c, i) => {
        let cellData = '';
        if (c.isLookup) {
          cellData = (row[c.key] as unknown as Lookup)?.getNames() ?? '';
        } else {
          cellData = row[c.key] as string;
        }
        csvContent += '"' + (cellData ?? '') + '"' + (i === columns.length - 1 ? '\r\n' : ',');
      });
    });

    return csvContent;
  }

  downloadCsvFile(fileName: string, csvData: string) {
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, fileName + '.csv');
  }
}
