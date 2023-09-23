import { ParamRangeField } from '@enums/param-range-field';
import { ParamRangeModel } from '@enums/param-range-model';

export class ParamRange {
  fieldName!: ParamRangeField;
  id!: number;
  isActive!: boolean;
  maxVal!: number;
  minVal!: number;
  model!: ParamRangeModel;
}
