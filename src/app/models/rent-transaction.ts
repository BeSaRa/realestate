import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { RentTransactionInterceptor } from '@model-interceptors/rent-transaction-interceptor';
import { BaseTableModel } from '@abstracts/base-table-model';

const { receive, send } = new RentTransactionInterceptor();

@InterceptModel({ receive, send })
export class RentTransaction extends BaseTableModel {
  municipalityid!: number;
  area!: number;
  bedRoomsCount!: number;
  propertyTypeId!: number;
  rentPaymentMonthly!: number;
  issueYear!: number;
  issueDate!: string;
  startDate!: string;
  endDate!: string;
  unitNo!: number;
  unitOwner!: number;
  unitBroker!: number;
  unitTenant!: number;
  serviceTypeId!: number;

  municipalityInfo!: Lookup;
  propertyTypeInfo!: Lookup;
  serviceTypeInfo!: Lookup;

  private _cols = PagesSections.SELL_PAGE.SELL_TRANSACTIONS_TABLE.columns;
  protected override _printCols: TableColPrint[] = [
    {
      colName: this._cols.LOCATION,
      header: 'municipal',
      cellValue: this.municipalityInfo?.getNames() ?? '---',
    },
    {
      colName: this._cols.LOCATION,
      header: 'area',
      cellValue: this.areaInfo?.getNames() ?? '---',
    },
    {
      colName: this._cols.SOLD_FOR,
      header: 'sold_for',
      cellValue: this.realEstateValue ?? '---',
    },
    {
      colName: this._cols.AREA,
      header: () => (this._unitsService.isMeterSelected() ? 'area_in_square_meter' : 'area_in_square_foot'),
      cellValue: () => (this._unitsService.isMeterSelected() ? this.realEstateMT : this.realEstateSQT),
    },
    {
      colName: this._cols.SQUARE_PRICE,
      header: () => (this._unitsService.isMeterSelected() ? 'the_square_meter_price' : 'the_square_foot_price'),
      cellValue: () => (this._unitsService.isMeterSelected() ? this.priceMT : this.priceSQ),
    },
    {
      colName: this._cols.ISSUE_DATE,
      header: 'issue_date',
      cellValue: this.issueDate?.slice(0, 10) ?? '---',
    },
    {
      colName: this._cols.ROI,
      header: 'roi',
      cellValue: this.roi ? (this.roi * 100).toPrecision(2) : '---',
    },
  ];
}
