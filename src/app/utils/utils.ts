import { NgModel } from '@angular/forms';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';
import { CitationsContract } from '@models/authority-base-message';

export function objectHasOwnProperty<O, P extends PropertyKey>(
  object: O,
  property: P
): object is O & Record<P, unknown> {
  return Object.prototype.hasOwnProperty.call(object, property);
}

export function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const range = (start: number, stop: number) => Array.from({ length: stop - start + 1 }, (_, i) => start + i);

export function formatNumber(num: number, precision = 1): string | number {
  // if (!num) return '---';
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    return (num / found.threshold).toFixed(precision) + found.suffix;
  }
  return num.toFixed(precision);
}

export function formatNumberWithSuffix(num: number, precision = 1) {
  const map = [
    { enSuffix: 'Trillions', arSuffix: 'تريليون', threshold: 1e12 },
    { enSuffix: 'Billions', arSuffix: 'مليار', threshold: 1e9 },
    { enSuffix: 'Millions', arSuffix: 'مليون', threshold: 1e6 },
    { enSuffix: 'Thousands', arSuffix: 'ألف', threshold: 1e3 },
    { enSuffix: '', arSuffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    return { num: (num / found.threshold).toFixed(precision), arSuffix: found.arSuffix, enSuffix: found.enSuffix };
  }
  return { num: num.toFixed(precision), enSuffix: '', arSuffix: '' };
}

export function isNgModel(control: unknown): control is NgModel {
  return control instanceof NgModel;
}

export function isValidValue(value: unknown): boolean {
  return typeof value === 'string' ? value.trim() !== '' : typeof value !== 'undefined' && value !== null;
}

export function isArray<T>(value: T | T[]): value is T[] {
  if (Array.isArray(value)) return true;
  else return false;
}

export function hasValidLength(value: unknown): boolean {
  if (!isValidValue(value)) {
    return false;
  }
  return typeof value === 'string' || typeof value === 'number';
}

export function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

export const groupBy = <T>(array: Array<T>, property: (x: T) => number): { [key: number]: Array<T> } =>
  array.reduce((memo: { [property: string]: Array<T> }, x: T) => {
    if (!memo[property(x)]) {
      memo[property(x)] = [];
    }
    memo[property(x)].push(x);
    return memo;
  }, {});

export function minMaxAvg(values: number[]): MinMaxAvgContract {
  values = values?.filter((v) => isValidValue(v));
  let max = values?.length ? values[0] : 0;
  let min = values?.length ? values[0] : 0;
  let sum = values?.length ? values[0] : 0;
  let avg = values?.length ? values[0] : 0; //changed from original post
  for (let i = 1; i < values?.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
    if (values[i] < min) {
      min = values[i];
    }
    sum = sum + values[i];
  }
  avg = sum / values?.length;
  avg = avg + (max - avg) * 0.4;
  // return { min: 0.5 * max, avg: 0.8 * max, max: max }; // this makes app to crash when trying to change to another duration type
  return { min, max, avg }; // because of customer requirements
}

export function repeat<T>(value: T, count: number) {
  const array: T[] = [];
  for (let i = 0; i < count; i++) {
    array.push(value);
  }

  return array;
}

export function isRTL(str: string) {
  return /[\u0600-\u06FF]+/.test(str);
}

export const formatString = (text: string) => {
  text
    .split(' ')
    .map((word) => (isRTL(word) ? '\u202A' : '\u202C') + word)
    .join(' ');
  return text;
};

export function formatText<T extends { context: { citations: CitationsContract[] } }>(
  text: string,
  message: T
): string {
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace text between [ and ] with <a> tags
  formattedText = formattedText.replace(/\[(.*?)\]/g, (match, p1) => {
    const item = message.context.citations[Number(p1.replace(/[^0-9]/g, '')) - 1];
    if (!item) {
      return match;
    }
    const title = item.title;
    const url = item.url;

    // eslint-disable-next-line max-len
    return `<br/><small class="px-1 text-[#cccccc]"><a class="underline" target="_blank" href="${url}">(${title})</a></small>`;
  });
  // text = text.replace(/\./g, '.<br>')

  // Return the formatted text
  return formattedText.trim();
}
