import { LangKeysContract } from '@contracts/lang-keys-contract';
import { Lookup } from '@models/lookup';

export abstract class BaseTableRowModel {
  hiddenCols: string[] = [];

  protected abstract getAllPrintCols(): TableColPrint[];
  getPrintCols(): TableColPrint[] {
    return this.getAllPrintCols().filter((c) => (c.colName ? !this.hiddenCols.includes(c.colName) : true));
  }
}

export type TableColPrint = {
  colName?: string;
  header: keyof LangKeysContract | (() => keyof LangKeysContract);
  cellValue: string | number | Lookup | (() => string | number);
  columnWidth?: number;
  isLookup?: boolean;
};
