import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '@services/config.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-version',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
})
export class VersionComponent {
  config = inject(ConfigService);
  lang = inject(TranslationService);
}
