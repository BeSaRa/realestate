import { BaseTableModel, TableColPrint } from '@abstracts/base-table-model';
import { PagesSections } from '@constants/pages-sections';
import { SellTransactionInterceptor } from '@model-interceptors/sell-transaction-interceptor';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';
import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';

const { receive, send } = new SellTransactionInterceptor();

@InterceptModel({ receive, send })
export class SellTransaction extends BaseTableModel {
  areaCode!: number;
  issueDate!: string;
  municipalityId!: number;
  priceMT!: number;
  priceSQ!: number;
  realEstateValue!: number;
  roi!: number;
  soldTo!: string;
  unitNo!: number;
  unitStatus!: number;
  realEstateSQT!: number;
  realEstateMT!: number;
  // not related to model
  municipalityInfo!: Lookup;
  areaInfo!: Lookup;
  unitStatusInfo!: Lookup;

  _unitsService = ServiceRegistry.get<UnitsService>('UnitsService');

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
