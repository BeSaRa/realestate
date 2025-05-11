import { LangKeysContract } from '@contracts/lang-keys-contract';

export abstract class BaseTableModel {
  protected abstract _printCols: TableColPrint[];
}

export type TableColPrint = {
  colName?: string;
  header: keyof LangKeysContract | (() => keyof LangKeysContract);
  cellValue: string | number | (() => string | number);
};
