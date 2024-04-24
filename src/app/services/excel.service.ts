import { inject, Injectable } from '@angular/core';
import { Column, Workbook, Worksheet } from 'exceljs';
import { TranslationService } from './translation.service';
import { saveAs } from 'file-saver';
import { AppColors } from '@constants/app-colors';
import { logoBase64 } from 'src/assets/images/mme-base64';
import { Lookup } from '@models/lookup';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  lang = inject(TranslationService);

  downloadExcelFile<T>(
    data: T[],
    fileName: string,
    criteria: string,
    columns: { key: keyof T; mapTo: string; isLookup?: boolean; columnWidth?: number }[]
  ) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.lang.map.general_secretariat_report);
    worksheet.views = [{ rightToLeft: !this.lang.isLtr, state: 'frozen', ySplit: 2 }];

    this._initHeader(worksheet, columns);
    this._initTopHeader(fileName + ' ' + criteria, workbook, worksheet);

    data.forEach((r, i) => {
      this._addingDataRow(r, i, columns, worksheet);
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName + ' ' + criteria);
    });
  }

  private _initHeader<T>(
    ws: Worksheet,
    columns: { key: keyof T; mapTo: string; isLookup?: boolean; columnWidth?: number }[]
  ) {
    const _columns: Partial<Column>[] = [];

    columns.forEach((c) => {
      _columns.push({
        key: c.key.toString(),
        width: c.columnWidth ?? 20,
      });
    });

    ws.columns = _columns;

    const _header: Record<string, string> = {};
    columns.forEach((c) => {
      _header[c.key.toString()] = c.mapTo;
    });

    const header = ws.addRow(_header);
    header.height = 20;
    header.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
    header.alignment = { horizontal: 'center', vertical: 'middle' };
    header.eachCell((cell) => {
      cell.fill = { fgColor: { argb: AppColors.SECONDARY.slice(1) }, type: 'pattern', pattern: 'solid' };
    });
  }

  private _initTopHeader(title: string, wb: Workbook, ws: Worksheet) {
    const topHeader = ws.insertRow(1, ['', '', '', '', title]);
    ws.mergeCells('A1:D1');
    ws.mergeCells('E1:I1');

    topHeader.height = 90;
    topHeader.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) }, size: 25 };
    topHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    const logo = wb.addImage({
      base64: logoBase64,
      extension: 'png',
    });
    ws.addImage(logo, 'A1:C1');
  }

  private _addingDataRow<T>(
    row: T,
    index: number,
    columns: { key: keyof T; mapTo: string; isLookup?: boolean; columnWidth?: number }[],
    ws: Worksheet
  ) {
    const _rowData: Record<string, string> = {};
    columns.forEach((c, i) => {
      if (c.isLookup) {
        _rowData[c.key.toString()] = (row[c.key] as unknown as Lookup)?.getNames() ?? '---';
      } else {
        _rowData[c.key.toString()] = (row[c.key] as string) ?? '---';
      }
    });

    const r = ws.addRow(_rowData);
    r.alignment = { horizontal: 'center', vertical: 'middle' };
    r.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) } };
    if (index % 2)
      r.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col <= columns.length) {
          cell.fill = { fgColor: { argb: AppColors.SECONDARY_40.slice(1) }, type: 'pattern', pattern: 'solid' };
          cell.border = {
            left: { style: 'thin', color: { argb: AppColors.SECONDARY.slice(1) } },
            right: { style: 'thin', color: { argb: AppColors.SECONDARY.slice(1) } },
          };
        }
      });
  }
}
