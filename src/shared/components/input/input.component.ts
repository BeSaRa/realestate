import { Component, ContentChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputPrefixDirective } from 'src/shared/directives/input-prefix.directive';
import { InputSuffixDirective } from 'src/shared/directives/input-suffix.directive';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input()
  disabled = false;
  @Input()
  displayErrors = true;
  @Input()
  size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input()
  placeholder = '';
  @Input()
  label = 'Please Provide Label';
  @Input()
  labelColor = 'text-slate-700';
  @Input()
  inputColor = 'text-slate-700';
  @Input()
  type = 'text';
  @Input()
  marginBottom = 'mb-5';
  @Input()
  noMargin = false;

  tailwindClass = `flex-auto ltr:peer-[.suffix]:pr-0 rtl:peer-[.suffix]:pl-0 ltr:peer-[.prefix]:pl-0
    rtl:peer-[.prefix]:pr-0 outline-none
    group-[.xs]/input-wrapper:text-xs group-[.lg]/input-wrapper:text-lg
    group-[.md]/input-wrapper:text-base group-[.sm]/input-wrapper:text-sm
    group-[.xs]/input-wrapper:px-1.5 group-[.xs]/input-wrapper:py-0.5
    group-[.sm]/input-wrapper:px-2 group-[.sm]/input-wrapper:py-1
    group-[.md]/input-wrapper:px-3 group-[.md]/input-wrapper:py-2
    group-[.lg]/input-wrapper:px-5 group-[.lg]/input-wrapper:py-3`;

  @ContentChild(InputPrefixDirective)
  inputPrefix?: InputPrefixDirective;

  @ContentChild(InputSuffixDirective)
  inputSuffix?: InputSuffixDirective;
}
