import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../title/title.component';
import { InputComponent } from '../input/input.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cadastral-inquiry',
  standalone: true,
  imports: [CommonModule, MatIconModule, TitleComponent, InputComponent],
  templateUrl: './cadastral-inquiry.component.html',
  styleUrls: ['./cadastral-inquiry.component.scss'],
})
export class CadastralInquiryComponent {}
