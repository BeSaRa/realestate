import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Law } from '@models/law';

@Component({
  selector: 'app-law-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './law-item.component.html',
  styleUrls: ['./law-item.component.scss'],
})
export class LawItemComponent {
  @Input({ required: true }) lawItemData!: Law;
}
