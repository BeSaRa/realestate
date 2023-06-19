import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-voting-form',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatRadioModule],
  templateUrl: './voting-form.component.html',
  styleUrls: ['./voting-form.component.scss'],
})
export class VotingFormComponent {
  lang = inject(TranslationService);
}
