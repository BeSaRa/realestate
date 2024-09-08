import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActionDirective } from '@components/actions-portal/actions-portal.component';
import { ButtonComponent } from '@components/button/button.component';
import { FlyerCompositeTableComponent } from '@components/flyer-composite-table/flyer-composite-table.component';
import { FlyerPropertyListComponent } from '@components/flyer-property-list/flyer-property-list.component';
import { FlyerSummaryComponent } from '@components/flyer-summary/flyer-summary.component';
import { FlyerTopTenComponent } from '@components/flyer-top-ten/flyer-top-ten.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { InputComponent } from '@components/input/input.component';
import { PriceRangeComponent } from '@components/price-range/price-range.component';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { AppIcons } from '@constants/app-icons';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { Durations } from '@enums/durations';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Lookup } from '@models/lookup';
import { ExcelSheetSectionsRegisterService } from '@services/excel-sheet-sections-register.service';
import { ExcelService } from '@services/excel.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { range } from '@utils/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { debounceTime, delay, takeUntil } from 'rxjs';

@Component({
  selector: 'app-flyers-page',
  standalone: true,
  providers: [{ provide: ExcelSheetSectionsRegisterService, useClass: ExcelSheetSectionsRegisterService }, DatePipe],
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    FlyerSummaryComponent,
    FlyerTopTenComponent,
    FlyerPropertyListComponent,
    ButtonComponent,
    PriceRangeComponent,
    ReactiveFormsModule,
    MatNativeDateModule,
    SelectInputComponent,
    InputComponent,
    FlyerCompositeTableComponent,
    ActionDirective,
    IconButtonComponent,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  templateUrl: './flyers-page.component.html',
  styleUrls: ['./flyers-page.component.scss'],
})
export default class FlyersPageComponent extends OnDestroyMixin(class {}) implements OnInit {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  lang = inject(TranslationService);
  urlService = inject(UrlService);
  lookupService = inject(LookupService);
  fb = inject(FormBuilder);
  adapter = inject(DateAdapter);
  datePipe = inject(DatePipe);
  document = inject(DOCUMENT);
  excelService = inject(ExcelService);
  excelSectionsRegisterService = inject(ExcelSheetSectionsRegisterService);

  durations = this.lookupService.rentLookups.durations.filter((d) => d.lookupKey !== Durations.HALF_YEARLY);
  years = range(2019, new Date().getFullYear());
  months: { label: string; value: number }[] = [];
  quarterYearDurations = this.lookupService.rentLookups.quarterYearDurations;

  minDate: Date = new Date('2019-01-01');
  maxDate: Date = new Date();

  form = this.fb.group({
    duration: [0],
    year: [new Date().getFullYear()],
    quarter: [null as unknown as number[]],
    month: [null as unknown as number],
    issueDateFrom: [''],
    issueDateTo: [''],
    rangeDate: [''],
  });

  get duration() {
    return this.form.controls.duration;
  }

  get year() {
    return this.form.controls.year;
  }

  get quarter() {
    return this.form.controls.quarter;
  }

  get month() {
    return this.form.controls.month;
  }

  get issueDateFrom() {
    return this.form.controls.issueDateFrom;
  }

  get issueDateTo() {
    return this.form.controls.issueDateTo;
  }

  get rangeDate() {
    return this.form.controls.rangeDate;
  }

  get displayYear() {
    return this.form.controls.duration.value !== Durations.DURATION;
  }

  get displayQuarter() {
    return this.form.controls.duration.value === Durations.QUARTER_YEARLY;
  }

  get displayMonth() {
    return this.form.controls.duration.value === Durations.MONTHLY;
  }

  get displayRange() {
    return this.form.controls.duration.value === Durations.DURATION;
  }

  criteria: FlyerCriteriaContract | undefined = undefined;

  isLoading = false;
  isExportingToPdf = false;

  propertyTypes = [
    new Lookup().clone<Lookup>({
      enName: 'Land',
      arName: 'أرض',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Villa',
      arName: 'فلل',
      lookupKey: 4,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Residential Complex',
      arName: 'مجمع سكني',
      lookupKey: 5,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Apartment',
      arName: 'شقة',
      lookupKey: 6,
    }),
  ];

  readonly AppIcons = AppIcons;

  ngOnInit(): void {
    this._setMonths();
    this.listenToLangChange();
    this.listenToDurationTypeChange();
    this.listenToFormValueChange();
    this.listenToIssueYearChange();
    this.duration.setValue(Durations.YEARLY);
  }

  listenToDurationTypeChange() {
    this.duration.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      if (d === Durations.YEARLY) {
        this.month.setValue(null, { emitEvent: false });
        this.quarter.setValue(null, { emitEvent: false });
        this.issueDateFrom.setValue(null, { emitEvent: false });
        this.issueDateTo.setValue(null, { emitEvent: false });
      } else if (d === Durations.QUARTER_YEARLY) {
        this.month.setValue(null, { emitEvent: false });
        this.quarter.setValue([1], { emitEvent: false });
        this.issueDateFrom.setValue(null, { emitEvent: false });
        this.issueDateTo.setValue(null, { emitEvent: false });
      } else if (d === Durations.MONTHLY) {
        this._setMonths();
        this.quarter.setValue(null, { emitEvent: false });
        this.month.setValue(1, { emitEvent: false });
        this.issueDateFrom.setValue(null, { emitEvent: false });
        this.issueDateTo.setValue(null, { emitEvent: false });
      } else {
        this.year.setValue(null, { emitEvent: false });
        this.month.setValue(null, { emitEvent: false });
        this.quarter.setValue(null, { emitEvent: false });
      }
    });
  }

  listenToFormValueChange() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$), delay(150), debounceTime(150)).subscribe(() => {
      if (this.displayRange && (!this.issueDateFrom.value || !this.issueDateTo.value)) return;
      this.updateCriteria();
    });
  }

  listenToIssueYearChange() {
    this.year.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((_) => {
      if (this.duration.value === Durations.MONTHLY) {
        this._setMonths();
      }
    });
  }

  rangeChange() {
    this.rangeDate.patchValue(
      (this.issueDateFrom.value ? this.datePipe.transform(this.issueDateFrom.value, 'YYY-MM-dd') : '') +
        ' -- ' +
        (this.issueDateTo.value ? this.datePipe.transform(this.issueDateTo.value, 'YYY-MM-dd') : '')
    );
  }

  updateCriteria() {
    let _criteria: FlyerCriteriaContract = {};
    if (this.displayRange) {
      _criteria = { issueDateFrom: this.issueDateFrom.value!, issueDateTo: this.issueDateTo.value! };
    } else {
      if (this.year.value) {
        _criteria = { ..._criteria, issueDateYear: this.year.value };
      }
      if (this.quarter.value?.length) {
        _criteria = { ..._criteria, issueDateQuarterList: this.quarter.value };
      } else {
        _criteria = { ..._criteria, issueDateQuarterList: [1, 2, 3, 4] };
      }
      if (this.month.value) {
        const _m = this.month.value;
        _criteria = { ..._criteria, issueDateMonth: _m, issueDateStartMonth: _m, issueDateEndMonth: _m };
      } else {
        _criteria = {
          ..._criteria,
          issueDateStartMonth: 1,
          issueDateEndMonth: this.year.value === new Date().getFullYear() ? new Date().getMonth() + 1 : 12,
        };
      }
    }

    this.criteria = _criteria;
  }

  listenToLangChange() {
    this.lang.change$.pipe(takeUntil(this.destroy$)).subscribe(() => this._setMonths());
  }

  private _setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));

    if (this.year.value === new Date().getFullYear()) {
      this.months = this.months.filter((month) => month.value <= new Date().getMonth() + 1);
    }
  }

  getTitleSuffix() {
    let _suffix = '';
    if (!this.displayRange) {
      _suffix += this.lang.map.for_year + ' ' + this.year.value;
      if (this.month.value) _suffix += ' (' + this.months[this.month.value - 1].label + ')';
      if (this.quarter.value?.length) {
        _suffix += ' (';
        this.quarter.value.forEach((q, i) => {
          _suffix += this.quarterYearDurations[q - 1].getNames();
          if (i !== this.quarter.value!.length - 1) {
            _suffix += '-';
          }
        });
        _suffix += ')';
      }
    }
    return _suffix;
  }

  exportToPDF() {
    this.isExportingToPdf = true;
    const _content = this.pdfContent.nativeElement as HTMLDivElement;

    const pdfTitle = this.document.getElementById('pdf-title');
    pdfTitle?.classList.remove('hidden');

    const htmlWidth = _content.clientWidth;
    const htmlHeight = _content.clientHeight;

    const topLeftMargin = 15;

    const pdfWidth = htmlWidth + topLeftMargin * 2;
    const pdfHeight = htmlHeight + topLeftMargin * 2;

    const canvasImageWidth = htmlWidth;
    const canvasImageHeight = htmlHeight;

    const totalPDFPages = Math.ceil(htmlHeight / pdfHeight) - 1;

    html2canvas(_content, { allowTaint: true }).then((canvas) => {
      canvas.getContext('2d');
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'png', topLeftMargin, topLeftMargin, canvasImageWidth, canvasImageHeight);

      for (let i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([pdfWidth, pdfHeight], 'p');
        pdf.addImage(
          imgData,
          'png',
          topLeftMargin,
          -(pdfHeight * i) + topLeftMargin * 4,
          canvasImageWidth,
          canvasImageHeight
        );
      }

      pdf.save(this.lang.map.real_estate_flyer + ' ' + this.getTitleSuffix());

      this.isExportingToPdf = false;
    });

    pdfTitle?.classList.add('hidden');
  }

  exportToExcel() {
    this.excelService.downloadExcelWithSectionsFile(
      this.excelSectionsRegisterService.sections,
      this.lang.map.real_estate_flyer,
      this.getTitleSuffix()
    );
  }
}
