import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@components/button/button.component';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { InputComponent } from '@components/input/input.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { TextareaComponent } from '@components/textarea/textarea.component';
import { InputPrefixDirective } from '@directives/input-prefix.directive';
import { InputSuffixDirective } from '@directives/input-suffix.directive';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-inputs-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderComponent,
    InputComponent,
    TextareaComponent,
    ButtonComponent,
    ReactiveFormsModule,
    InputPrefixDirective,
    InputSuffixDirective,
    MatIconModule,
    SelectInputComponent,
  ],
  templateUrl: './inputs-page.component.html',
  styleUrls: ['./inputs-page.component.scss'],
})
export default class InputsPageComponent {
  lang = inject(TranslationService);
}
