import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons } from '@constants/app-icons';
import { ChangeIndicatorService } from '@services/change-indicator.service';

@Component({
  selector: 'app-change-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './change-indicator.component.html',
  styleUrls: ['./change-indicator.component.scss'],
})
export class ChangeIndicatorComponent {
  @Input({ required: true }) isHovered!: boolean;
  @Input({ required: true }) value!: number;

  changeIndicatorService = inject(ChangeIndicatorService);
  changeIndicatorType = computed(() => this.changeIndicatorService.changeIndicatorType());

  icons = AppIcons;
}
