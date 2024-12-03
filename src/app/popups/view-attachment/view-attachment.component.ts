import { Component, inject, OnInit } from '@angular/core';
import { TranslationService } from '@services/translation.service';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { Attachment } from '@models/attachment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-view-attachment',
  standalone: true,
  imports: [MatDialogClose, IconButtonComponent],
  templateUrl: './view-attachment.component.html',
  styleUrl: './view-attachment.component.scss',
})
export class ViewAttachmentComponent implements OnInit {
  lang = inject(TranslationService);
  sanitizer = inject(DomSanitizer);
  data = inject<{
    model: Attachment;
  }>(MAT_DIALOG_DATA);
  declare srcURL: SafeUrl;

  ngOnInit(): void {
    this.srcURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.data.model.file));
  }
}
