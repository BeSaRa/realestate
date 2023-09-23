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
import { MAT_SELECT_SCROLL_STRATEGY, MatSelect, MatSelectModule } from '@angular/material/select';
import { ValidationErrorsComponent } from '@components/validation-errors/validation-errors.component';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { OptionTemplateDirective } from '@directives/option-template.directive';
import { FilterArrayPipe } from '@pipes/filter-array.pipe';
import { TranslationService } from '@services/translation.service';
import { generateUUID, objectHasOwnProperty } from '@utils/utils';
import { debounceTime, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { InputComponent } from '../input/input.component';
import { Overlay } from '@angular/cdk/overlay';

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
    {
      provide: MAT_SELECT_SCROLL_STRATEGY,
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
      deps: [Overlay],
    },
  ],
})
export class SelectInputComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() isSecondary = false;
  @Input() disabled = false;
  @Input() displayErrors = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() placeholder = '';
  @Input() label = 'Please Provide Label';
  @Input() labelColor = 'text-black';
  @Input() bgColor = 'bg-white';
  @Input() borderColor = 'border-black';
  @Input() marginBottom = 'mb-5';
  @Input() noMargin = false;
  @Input() isMultiple = false;
  @Input() name = generateUUID();
  @Input({ required: true }) options: unknown[] = [];
  @Input() bindValue?: string | ((item: unknown) => unknown);
  @Input() bindLabel?: string | ((item: unknown) => unknown);
  @Input() bindFilter?: string | ((item: unknown) => unknown);
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

  tailwindClass = `flex-auto rounded-md max-w-full outline-none
    ltr:peer-[.suffix]:pr-0 rtl:peer-[.suffix]:pl-0
    ltr:peer-[.prefix]:pl-0 rtl:peer-[.prefix]:pr-0
    group-[.xl]/input-wrapper:!text-xl group-[.lg]/input-wrapper:!text-lg
    group-[.md]/input-wrapper:!text-base group-[.sm]/input-wrapper:!text-sm
    group-[.sm]/input-wrapper:px-1.5 group-[.sm]/input-wrapper:py-1
    group-[.md]/input-wrapper:px-2 group-[.md]/input-wrapper:py-1.5
    group-[.lg]/input-wrapper:px-3 group-[.lg]/input-wrapper:py-2
    group-[.xl]/input-wrapper:px-4 group-[.xl]/input-wrapper:py-2.5`;

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
    this.labelColor = this.isSecondary ? 'text-gray-500' : 'text-black';
    this.borderColor = this.isSecondary ? 'border-gray-500' : 'border-black';
    this.ctrl = this.injector.get(NgControl, null, {
      self: true,
      optional: true,
    });
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.onChange && this.onChange(value));
    this._onDisabled();
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
    this._changeSelectArrow();
    this.selectInput?.openedChange.pipe(takeUntil(this.destroy$)).subscribe((isOpened) => {
      isOpened ? this._setSelectDirection() : this.filterControl.setValue('');
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
    this._onDisabled();
  }

  inputTouch() {
    this.onTouch && this.onTouch();
  }

  delegateFocus() {
    (this.selectInput?._elementRef.nativeElement as HTMLElement).focus();
    this.selectInput?.open();
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

  isOptionDisabled(item: unknown): boolean {
    return (item as { disabled: boolean }).disabled;
  }

  compareOptionsWith(value1: unknown, value2: unknown) {
    return value1 == value2;
  }

  private _changeSelectArrow() {
    const selectArrowElement = (this.elementRef.nativeElement as HTMLElement).querySelector('.mat-mdc-select-arrow');
    const width = this.size == 'sm' ? '14px' : this.size == 'md' ? '17px' : this.size == 'lg' ? '20px' : '24px';
    if (selectArrowElement) {
      selectArrowElement.innerHTML = `
      <svg viewBox="0 0 24 24" class="${this.labelColor}" width="${width}" height="${width}" focusable="false">
        <title>chevron-down-circle-outline</title>
        <path d="M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12M6,10L12,16L18,10L16.6,8.6L12,13.2L7.4,8.6L6,10Z" />
      </svg>
    `;
    }
  }

  private _onDisabled() {
    const selectArrowElement = (this.elementRef.nativeElement as HTMLElement).querySelector('.mat-mdc-select-arrow');
    if (this.disabled) {
      selectArrowElement?.classList.remove(this.labelColor);
      selectArrowElement?.classList.add('text-slate-300');
    } else {
      selectArrowElement?.classList.remove('text-slate-300');
      selectArrowElement?.classList.add(this.labelColor);
    }
  }

  private _setSelectDirection() {
    const current = this.lang.getCurrent();
    const overlayWrapper = document.querySelectorAll<HTMLDivElement>('.cdk-overlay-connected-position-bounding-box');
    overlayWrapper.forEach((item: HTMLDivElement) => {
      item.dir = current.direction;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  closeSelect() {
    this.filterControl.setValue('');
  }
}
