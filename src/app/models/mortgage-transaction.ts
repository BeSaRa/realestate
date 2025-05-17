import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { MortgageTransactionInterceptor } from '@model-interceptors/mortgage-transaction-interceptor';
import { BaseTableRowModel, TableColPrint } from '@abstracts/base-table-row-model';
import { PagesSections } from '@constants/pages-sections';

const { receive, send } = new MortgageTransactionInterceptor();

@InterceptModel({ receive, send })
export class MortgageTransaction extends BaseTableRowModel {
  areaCode!: number;
  issueDate!: string;
  municipalityId!: number;
  priceMT!: number;
  realEstateValue!: number;
  realEstateArea!: number;
  seller!: string;
  buyer!: string;
  unitNo!: number;
  unitStatus!: number;

  // not related to model
  municipalityInfo!: Lookup;
  areaInfo!: Lookup;
  unitStatusInfo!: Lookup;

  private _cols = PagesSections.MORT_PAGE.MORT_TRANSACTIONS_TABLE.columns;
  protected override getAllPrintCols(): TableColPrint[] {
    return [
      {
        colName: this._cols.LOCATION,
        header: 'municipal',
        cellValue: this.municipalityInfo,
        isLookup: true,
      },
      {
        colName: this._cols.LOCATION,
        header: 'area',
        cellValue: this.areaInfo,
        isLookup: true,
      },
      {
        colName: this._cols.MORTGAGED_FOR,
        header: 'mortgaged_for',
        cellValue: this.realEstateValue,
      },
      {
        colName: this._cols.AREA,
        header: 'area_in_square_meter',
        cellValue: this.realEstateArea,
      },
      {
        colName: this._cols.ISSUE_DATE,
        header: 'issue_date',
        cellValue: this.issueDate.slice(0, 10),
      },
    ];
  }
}
