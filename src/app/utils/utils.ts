import { NgModel } from '@angular/forms';
import { MinMaxAvgContract } from '@contracts/min-max-avg-contract';

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
  return num;
}

export function isNgModel(control: unknown): control is NgModel {
  return control instanceof NgModel;
}

export function isValidValue(value: unknown): boolean {
  return typeof value === 'string' ? value.trim() !== '' : typeof value !== 'undefined' && value !== null;
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

export function minMaxAvg(values: number[]): MinMaxAvgContract {
  let max = values[0];
  let min = values[0];
  let sum = values[0]; //changed from original post
  for (let i = 1; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
    if (values[i] < min) {
      min = values[i];
    }
    sum = sum + values[i];
  }
  return { min, max, avg: sum / values.length };
}

export function formatChartColors(minMaxAvg: MinMaxAvgContract) {
  return ({ value }: { value: number }): string => {
    if (value >= minMaxAvg.min && value < minMaxAvg.avg) return '#8A1538';
    if (value >= minMaxAvg.avg && value < minMaxAvg.max) return '#C0C0C0';
    return '#A29475';
  };
}
