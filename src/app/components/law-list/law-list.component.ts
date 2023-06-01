import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Law } from '@models/law';
import { LawItemComponent } from '@components/law-item/law-item.component';

@Component({
  selector: 'app-law-list',
  standalone: true,
  imports: [CommonModule, LawItemComponent],
  templateUrl: './law-list.component.html',
  styleUrls: ['./law-list.component.scss'],
})
export class LawListComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) lawData!: Law[];
}
