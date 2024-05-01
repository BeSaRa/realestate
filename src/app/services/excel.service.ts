import { inject, Injectable } from '@angular/core';
import { Cell, Column, Workbook, Worksheet } from 'exceljs';
import { TranslationService } from './translation.service';
import { saveAs } from 'file-saver';
import { AppColors } from '@constants/app-colors';
import { logoBase64 } from 'src/assets/images/mme-base64';
import { Lookup } from '@models/lookup';
import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';

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

  downloadExcelWithSectionsFile(sections: AddSectionToExcelSheet[], fileName: string, criteria: string) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.lang.map.general_secretariat_report);
    worksheet.views = [{ rightToLeft: !this.lang.isLtr, state: 'frozen', ySplit: 1 }];

    this._initTopHeader(fileName + ' ' + criteria, workbook, worksheet);

    sections.forEach((section) => {
      section.addToExcelSheet(workbook, worksheet);
      worksheet.addRows([[], []]);
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName + ' ' + criteria);
    });
  }

  addHeaderRow(workSheet: Worksheet, data: any) {
    const row = workSheet.addRow(data);
    row.height = 30;
    row.font = { bold: true, color: { argb: 'FFFFFF' }, size: 15 };
    row.alignment = { horizontal: 'center', vertical: 'middle' };
    row.eachCell((cell) => {
      cell.fill = { fgColor: { argb: AppColors.SECONDARY.slice(1) }, type: 'pattern', pattern: 'solid' };
    });

    workSheet.columns.forEach((c) => (c.width = c.width ?? 20));

    return row;
  }

  addSubHeaderRow(workSheet: Worksheet, data: any) {
    const row = workSheet.addRow(data);
    row.height = 25;
    row.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) }, size: 13 };
    row.alignment = { horizontal: 'center', vertical: 'middle' };

    workSheet.columns.forEach((c) => (c.width = c.width ?? 20));

    return row;
  }

  addDataRow(workSheet: Worksheet, data: any, index: number) {
    const r = workSheet.addRow(data);
    r.alignment = { horizontal: 'center', vertical: 'middle' };
    r.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) } };
    if (index % 2)
      r.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col <= data.length) {
          cell.fill = { fgColor: { argb: AppColors.SECONDARY_40.slice(1) }, type: 'pattern', pattern: 'solid' };
          cell.border = {
            left: { style: 'thin', color: { argb: AppColors.SECONDARY.slice(1) } },
            right: { style: 'thin', color: { argb: AppColors.SECONDARY.slice(1) } },
          };
        }
      });

    workSheet.columns.forEach((c) => (c.width = c.width ?? 20));

    return r;
  }

  stylePercentCell(c: Cell, value: number) {
    c.font = { color: { argb: 'FFFFFF' } };
    c.numFmt = '0.0%';
    c.fill = {
      fgColor: {
        argb: value > 0 ? AppColors.SECONDARY_60.slice(1) : AppColors.PRIMARY_60.slice(1),
      },
      type: 'pattern',
      pattern: 'solid',
    };
    c.border = {
      left: { style: 'thin', color: { argb: value > 0 ? AppColors.SECONDARY.slice(1) : AppColors.PRIMARY.slice(1) } },
      right: { style: 'thin', color: { argb: value > 0 ? AppColors.SECONDARY.slice(1) : AppColors.PRIMARY.slice(1) } },
      bottom: { style: 'thin', color: { argb: value > 0 ? AppColors.SECONDARY.slice(1) : AppColors.PRIMARY.slice(1) } },
    };
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

    this.addHeaderRow(ws, _header);
  }

  private _initTopHeader(title: string, wb: Workbook, ws: Worksheet) {
    const topHeader = ws.insertRow(1, ['', '', '', '', title, '', '', '', '']);
    ws.columns.forEach((c) => (c.width = c.width ?? 20));
    ws.mergeCells('A1:D1');
    ws.mergeCells('E1:I1');

    topHeader.height = 90;
    topHeader.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) }, size: 25 };
    topHeader.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

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
