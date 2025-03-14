import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  inject,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, map, Observable, of, takeUntil } from 'rxjs';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { ControlDirective } from '@directives/control.directive';
import { generateUUID, isNgModel } from '@utils/utils';
import { ValidationErrorsComponent } from '@components/validation-errors/validation-errors.component';
import { requiredValidator } from '@validators/validation-utils';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidationErrorsComponent],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TextareaComponent,
    },
  ],
})
export class TextareaComponent
  extends OnDestroyMixin(class {})
  implements ControlValueAccessor, OnInit, AfterContentInit, OnChanges
{
  @Input() disabled = false;
  @Input() displayErrors = true;
  @Input() name = generateUUID();
  @Input() placeholder = '';
  @Input() label = 'Please Provide Label';
  @Input() labelColor = 'text-black';
  @Input() inputColor = 'text-black';
  @Input() bgColor = 'bg-white';
  @Input() borderColor = 'border-black';
  @Input() placeholderColor = 'placeholder-black/50';
  @Input() caretColor = 'caret-black';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() rows: string | number = 4;
  @Input() marginBottom = 'mb-5';
  @Input() noMargin = false;
  @Input() resizable = false;

  @ContentChild(ControlDirective) template?: ControlDirective;

  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);

  private ctrl!: NgControl | null;

  control = new FormControl('');

  hasCustomControl = false;

  tailwindClass = `flex-auto outline-none rounded-md max-w-full
     group-[.xl]/text-area-wrapper:text-xl group-[.lg]/text-area-wrapper:text-lg
     group-[.md]/text-area-wrapper:text-base group-[.sm]/text-area-wrapper:text-sm
     group-[.sm]/text-area-wrapper:px-1.5 group-[.sm]/text-area-wrapper:py-1
     group-[.md]/text-area-wrapper:px-2 group-[.md]/text-area-wrapper:py-1.5
     group-[.lg]/text-area-wrapper:px-3 group-[.lg]/text-area-wrapper:py-2
     group-[.xl]/text-area-wrapper:px-4 group-[.xl]/text-area-wrapper:py-2.5`;

  get isRequired(): boolean {
    return this.ctrl?.control?.hasValidator(requiredValidator) || false;
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
        const input =
          this.template.element.nativeElement.querySelector('textarea') ?? this.template.element.nativeElement;
        this.setInputMissingProperties(input);
        this.ctrl = this.template.control;
        !isNgModel(this.ctrl) && this.listenToCtrlValueChanges();
      }
    });
  }

  onChange!: (value: string | null) => void;
  onTouch!: () => void;

  writeValue(value: string): void {
    this.control.setValue(value, { emitEvent: false });
    this.cdr.markForCheck();
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

  private listenToCtrlValueChanges() {
    this.ctrl?.valueChanges?.subscribe(() => this.cdr.markForCheck());
  }
}
