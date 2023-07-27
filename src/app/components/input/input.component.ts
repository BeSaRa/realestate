import {
  AfterContentInit,
  Component,
  ContentChild,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { ValidationErrorsComponent } from '@components/validation-errors/validation-errors.component';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { ControlDirective } from '@directives/control.directive';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { generateUUID } from '@utils/utils';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ValidationErrorsComponent, NgxMaskDirective, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterContentInit, OnChanges {
  @Input() disabled = false;
  @Input() displayErrors = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() placeholder = '';
  @Input() label = 'Please Provide Label';
  @Input() labelColor = 'text-black';
  @Input() inputColor = 'text-black';
  @Input() bgColor = 'bg-white';
  @Input() borderColor = 'border-black';
  @Input() placeholderColor = 'placeholder-black/50';
  @Input() caretColor = 'caret-black';
  @Input() type = 'text';
  @Input() marginBottom = 'mb-5';
  @Input() noMargin = false;
  @Input() name = generateUUID();

  @ContentChild(ControlDirective) template?: ControlDirective;
  @ContentChild(InputPrefixDirective) inputPrefix?: InputPrefixDirective;
  @ContentChild(InputSuffixDirective) inputSuffix?: InputSuffixDirective;

  private injector = inject(Injector);

  private ctrl!: NgControl | null;

  private destroy$ = new Subject<void>();

  control = new FormControl('');

  hasCustomControl = false;

  tailwindClass = `flex-auto rounded-md max-w-full outline-none
     ltr:peer-[.suffix]:pr-0 rtl:peer-[.suffix]:pl-0
     ltr:peer-[.prefix]:pl-0 rtl:peer-[.prefix]:pr-0
     group-[.xl]/input-wrapper:!text-xl group-[.lg]/input-wrapper:!text-lg
     group-[.md]/input-wrapper:!text-base group-[.sm]/input-wrapper:!text-sm
     group-[.sm]/input-wrapper:px-1.5 group-[.sm]/input-wrapper:py-1
     group-[.md]/input-wrapper:px-2 group-[.md]/input-wrapper:py-1.5
     group-[.lg]/input-wrapper:px-3 group-[.lg]/input-wrapper:py-2
     group-[.xl]/input-wrapper:px-4 group-[.xl]/input-wrapper:py-2.5`;

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
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.onChange && this.onChange(value));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && changes['disabled'].currentValue !== changes['disabled'].previousValue) {
      (changes['disabled'].currentValue as boolean)
        ? this.control.disable({ emitEvent: false })
        : this.control.enable({ emitEvent: false });
    }
  }

  ngAfterContentInit(): void {
    this.hasCustomControl = !!this.template;
    Promise.resolve().then(() => {
      if (this.template) {
        const input = this.template.element.nativeElement.querySelector('input') ?? this.template.element.nativeElement;
        this.setInputMissingProperties(input);
        this.ctrl = this.template.control;
      }
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

  setInputMissingProperties(element: HTMLElement): void {
    element.classList.add(...this.tailwindClass.split(' '));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
