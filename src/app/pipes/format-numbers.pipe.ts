import { Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@utils/utils';

@Pipe({
  name: 'formatNumbers',
  standalone: true,
})
export class FormatNumbersPipe implements PipeTransform {
  transform(value: number, precision = 1): unknown {
    return formatNumber(value, precision);
  }
}
