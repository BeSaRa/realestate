import { inject } from '@angular/core';
import { ExcelSheetSectionsRegisterService } from '@services/excel-sheet-sections-register.service';
import { ExcelService } from '@services/excel.service';
import { Workbook, Worksheet } from 'exceljs';

export abstract class AddSectionToExcelSheet {
  private _register = inject(ExcelSheetSectionsRegisterService, { optional: true });
  excelService = inject(ExcelService);

  constructor() {
    this._register && this._register.registerSection(this);
  }

  abstract addToExcelSheet(workbook: Workbook, worksheet: Worksheet): void;
}
