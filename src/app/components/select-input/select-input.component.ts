import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ValidationErrorsComponent } from '@components/validation-errors/validation-errors.component';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { OptionTemplateDirective } from '@directives/option-template.directive';
import { FilterArrayPipe } from '@pipes/filter-array.pipe';
import { TranslationService } from '@services/translation.service';
import { generateUUID, objectHasOwnProperty } from '@utils/utils';
import { debounceTime, map, Observable, of, Subject } from 'rxjs';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [
    CommonModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    ValidationErrorsComponent,
    ReactiveFormsModule,
    InputComponent,
    FilterArrayPipe,
  ],
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SelectInputComponent,
    },
  ],
})
export class SelectInputComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() disabled = false;
  @Input() displayErrors = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() placeholder = '';
  @Input() label = 'Please Provide Label';
  @Input() labelColor = 'text-slate-700';
  @Input() bgColor = 'bg-white';
  @Input() borderColor = 'border-slate-300';
  @Input() marginBottom = 'mb-5';
  @Input() noMargin = false;
  @Input() isMultiple = false;
  @Input() name = generateUUID();
  @Input({ required: true }) options: unknown[] = [];
  @Input() bindValue?: string | ((item: any) => any);
  @Input() bindLabel?: string | ((item: any) => any);
  @Input() bindFilter?: string | ((item: any) => any);
  @Input() enableFilter = false;

  @ContentChild(OptionTemplateDirective) optionTemplate?: OptionTemplateDirective;
  @ContentChild(InputPrefixDirective) inputPrefix?: InputPrefixDirective;
  @ContentChild(InputSuffixDirective) inputSuffix?: InputSuffixDirective;
  @ContentChildren(MatOption) _selectOptions?: QueryList<MatOption>;
  @ViewChild('selectInput') selectInput?: MatSelect;

  private injector = inject(Injector);
  elementRef = inject(ElementRef);
  lang = inject(TranslationService);

  private ctrl!: NgControl | null;

  private destroy$ = new Subject<void>();

  control = new FormControl('');

  filterControl = new FormControl('');

  tailwindClass = `flex-auto rounded-md max-w-full outline-none px-3 py-1.5
    ltr:peer-[.suffix]:pr-0 rtl:peer-[.suffix]:pl-0
    ltr:peer-[.prefix]:pl-0 rtl:peer-[.prefix]:pr-0
    group-[.xl]/input-wrapper:!text-xl group-[.lg]/input-wrapper:!text-lg
    group-[.md]/input-wrapper:!text-base group-[.sm]/input-wrapper:!text-sm`;

  get filterTxt$() {
    return this.filterControl.valueChanges;
  }

  get errors(): Observable<ValidationErrors | null | undefined> {
    return of(null).pipe(
      debounceTime(200),
      map(() => (this.ctrl?.dirty || this.ctrl?.touched ? this.ctrl?.errors : undefined))
    );
  }

  ngOnInit(): void {
    this.ctrl = this.injector.get(NgControl, null, {
      self: true,
      optional: true,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && changes['disabled'].currentValue !== changes['disabled'].previousValue) {
      (changes['disabled'].currentValue as boolean)
        ? this.control.disable({ emitEvent: false })
        : this.control.enable({ emitEvent: false });
    }
  }

  ngAfterViewInit(): void {
    Promise.resolve(!!this.optionTemplate).then((value) => {
      if (!value) return;
      const options = this._selectOptions?.toArray() || [];
      this.selectInput?.options.reset(options);
      this.selectInput?.options.notifyOnChanges();
    });
  }

  onChange!: (value: string | null) => void;
  onTouch!: () => void;

  writeValue(value: string): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.disabled ? this.control.disable({ emitEvent: false }) : this.control.enable({ emitEvent: false });
  }

  inputTouch() {
    this.onTouch && this.onTouch();
  }

  delegateFocus() {
    const select = 'mat-select';
    this.elementRef.nativeElement.querySelector(select).focus();
  }

  getBindValue(option: unknown): unknown {
    return this.bindValue && typeof this.bindValue === 'string'
      ? typeof (option as never)[this.bindValue] === 'function'
        ? ((option as never)[this.bindValue] as () => unknown)()
        : objectHasOwnProperty(option, this.bindValue)
        ? option[this.bindValue]
        : option
      : this.bindValue && typeof this.bindValue === 'function'
      ? this.bindValue(option)
      : option;
  }

  getBindLabel(option: unknown): unknown {
    return this.bindLabel && typeof this.bindLabel === 'string'
      ? typeof (option as never)[this.bindLabel] === 'function'
        ? ((option as never)[this.bindLabel] as () => unknown)()
        : objectHasOwnProperty(option, this.bindLabel)
        ? option[this.bindLabel]
        : option
      : this.bindLabel && typeof this.bindLabel === 'function'
      ? this.bindLabel(option)
      : option;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
