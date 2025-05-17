import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { RentTransactionInterceptor } from '@model-interceptors/rent-transaction-interceptor';
import { BaseTableRowModel, TableColPrint } from '@abstracts/base-table-row-model';
import { PagesSections } from '@constants/pages-sections';

const { receive, send } = new RentTransactionInterceptor();

@InterceptModel({ receive, send })
export class RentTransaction extends BaseTableRowModel {
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

  private _cols = PagesSections.RENT_PAGE.RENT_TRANSACTIONS_TABLE.columns;
  protected override getAllPrintCols(): TableColPrint[] {
    return [
      {
        colName: this._cols.MUNICIPALITY,
        header: 'municipal',
        cellValue: this.municipalityInfo,
        isLookup: true,
      },
      {
        colName: this._cols.UNIT_DETAILS,
        header: 'rooms',
        cellValue: this.bedRoomsCount,
      },
      {
        colName: this._cols.UNIT_DETAILS,
        header: 'unit_type',
        cellValue: this.propertyTypeInfo,
        isLookup: true,
      },
      {
        colName: this._cols.RENTAL_VALUE,
        header: 'contract_status',
        cellValue: this.serviceTypeInfo,
        isLookup: true,
      },
      {
        colName: this._cols.ISSUE_DATE,
        header: 'documentation_date',
        cellValue: this.issueDate?.slice(0, 10),
      },
      {
        colName: this._cols.CONTRACT_START_DATE,
        header: 'contract_start_date',
        cellValue: this.startDate?.slice(0, 10),
      },
      {
        colName: this._cols.CONTRACT_END_DATE,
        header: 'contract_end_date',
        cellValue: this.endDate?.slice(0, 10),
      },
    ];
  }
}
