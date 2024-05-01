import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';
import { Injectable } from '@angular/core';

@Injectable()
export class ExcelSheetSectionsRegisterService {
  private _sections: AddSectionToExcelSheet[] = [];

  get sections() {
    return this._sections;
  }

  registerSection(section: AddSectionToExcelSheet) {
    this._sections.push(section);
  }

  clearSections() {
    this._sections = [];
  }
}
