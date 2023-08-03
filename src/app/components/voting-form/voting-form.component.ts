import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatRadioModule],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.scss'],
})
export class VotingFormComponent {
  lang = inject(TranslationService);
}
