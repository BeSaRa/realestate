import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslationService } from '@services/translation.service';

@Directive({
  selector: '[appOnlyCurrentLangLetters]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: OnlyCurrentLangLettersDirective,
      multi: true,
    },
  ],
})
export class OnlyCurrentLangLettersDirective implements ControlValueAccessor {
  private elementRef = inject(ElementRef);
  private lang = inject(TranslationService);

  private onChange!: (val: string) => void;
  private onTouched!: () => void;
  private value!: string;
  private isDisabled = false;

  @HostListener('input', ['$event.target.value'])
  onInputChange(value: string) {
    const filteredValue: string = this._checkValue(value) ? value : value.slice(0, value.length - 1);
    this._updateTextInput(filteredValue, this.value !== filteredValue);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value ? String(value) : '';
    this._updateTextInput(value, false);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    (this.elementRef.nativeElement as HTMLInputElement).disabled = isDisabled;
  }

  private _checkValue(val: string) {
    return !this.lang.isLtr ? /^[^a-zA-Z]+$/.test(val) : /^[^\u0621-\u064A]+$/.test(val);
  }

  private _updateTextInput(value: string, propagateChange: boolean) {
    (this.elementRef.nativeElement as HTMLInputElement).value = value;
    if (propagateChange) {
      this.onChange(value);
    }
    this.value = value;
  }
}
