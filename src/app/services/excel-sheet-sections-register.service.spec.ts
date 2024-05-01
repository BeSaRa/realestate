import { TestBed } from '@angular/core/testing';

import { ExcelSheetSectionsRegisterService } from './excel-sheet-sections-register.service';

describe('ExcelSheetSectionsRegisterService', () => {
  let service: ExcelSheetSectionsRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelSheetSectionsRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
