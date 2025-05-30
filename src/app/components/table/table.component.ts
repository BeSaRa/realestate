import { BaseTableRowModel } from '@abstracts/base-table-row-model';
import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  inject,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '@components/button/button.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { TableActionDirective } from '@directives/table-action.directive';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AppTableDataSource } from '@models/app-table-data-source';
import { Pagination } from '@models/pagination';
import { TableSortOption } from '@models/table-sort-option';
import { ExcelService } from '@services/excel.service';
import { SectionGuardService } from '@services/section-guard.service';
import { TranslationService } from '@services/translation.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    ButtonComponent,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends object> extends OnDestroyMixin(class {}) implements OnInit, OnChanges {
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) dataLoadFn!: (criteria: CriteriaContract) => Observable<Pagination<T>>;
  @Input() title = '';
  @Input() pageSize = 5;
  @Input() tableGuardName = '';
  @Input() sortOptions: TableSortOption[] = [];
  @Input() defaultSortOption?: TableSortOption;
  @Input() enablePagination = true;
  @Input() minWidth = '1000px';
  @Input() headerBgColor = '!bg-primary';
  @Input() textSize = '!text-xl';

  @ViewChild('paginator') paginator!: MatPaginator;
  @ContentChildren(TableColumnTemplateDirective) columnsTemplates!: QueryList<TableColumnTemplateDirective>;
  @ContentChildren(TableActionDirective) actionsTemplates!: QueryList<TableActionDirective>;

  lang = inject(TranslationService);
  sectionGuardService = inject(SectionGuardService);
  excelService = inject(ExcelService);

  sortControl = new FormControl<{ column: string; direction: 'asc' | 'desc' } | undefined>(undefined);

  data$ = new BehaviorSubject<T[]>([]);
  dataSource = new AppTableDataSource<T>(this.data$);

  reload$ = new Subject<void>();
  paginate$ = new BehaviorSubject({
    offset: 0,
    limit: this.pageSize,
  });

  sortedData$ = this.data$.asObservable();

  length = 0;
  pageSizeOptions: number[] = [2, 5, 10];
  showFirstLastButtons = true;
  offset = 0;

  isLoading = false;
  isReload = false;

  isDownloading = false;
  isDownloadingFull = false;

  get displayedColumnNames() {
    return this.columnsTemplates.map((c) => c.columnName).filter((c) => !this.isColumnHidden(c));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('criteria' in changes) {
      if (this.criteria) {
        setTimeout(() => {
          this.reload$.next();
        }, 0);
        this.paginator && this.paginator.firstPage();
      }
    }
  }

  ngOnInit(): void {
    this.paginate$.next({ offset: 0, limit: this.pageSize });
    this._listenToTransactionsReloadAndPaginate();
    this._initializeSort();
    this.sortControl.patchValue(this.defaultSortOption?.value);
  }

  downloadEnabled() {
    return typeof this.data$.value.length && this.data$.value[0] instanceof BaseTableRowModel;
  }

  getColumnTemplate(columnName: string) {
    return this.columnsTemplates.find((c) => c.columnName === columnName);
  }

  isColumnHidden(columnName: string) {
    return this.sectionGuardService.currentPageSectionsGuards
      ? this.sectionGuardService.currentPageSectionsGuards.sections[this.tableGuardName]
        ? this.sectionGuardService.currentPageSectionsGuards.sections[this.tableGuardName].isColumnHidden(columnName)
        : false
      : false;
  }

  downloadReport() {
    if (this.isDownloading || this.isReload || this.isLoading) return;
    this.isDownloading = true;
    this._toExcel(this.data$.value as BaseTableRowModel[]);
    this.isDownloading = false;
  }

  downloadFullReport() {
    if (this.isDownloadingFull || this.isReload || this.isLoading) return;
    this.isDownloadingFull = true;

    const _downloadCriteria = { ...this.criteria, limit: this.length };
    this.dataLoadFn(_downloadCriteria)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isDownloadingFull = false)),
        catchError(() => {
          return of<Pagination<T>>({ count: 0, transactionList: [] });
        })
      )
      .subscribe((res) => {
        this._toExcel(res.transactionList as BaseTableRowModel[]);
      });
  }

  private _toExcel(data: BaseTableRowModel[]) {
    const _hiddenCols = data[0]
      .getPrintCols()
      .map((c) => c.colName)
      .filter((n) => n && !this.displayedColumnNames.includes(n));
    data.forEach((d) => {
      d.hiddenCols = _hiddenCols as string[];
    });

    this.excelService.downloadExcelFile(data, this.title);
  }

  _paginate($event: PageEvent) {
    this.paginate$.next({ offset: $event.pageSize * $event.pageIndex, limit: $event.pageSize });
    this.offset = $event.pageSize * $event.pageIndex;
    this.pageSize = $event.pageSize;
    // this._initializeDataSource();
  }

  private _listenToTransactionsReloadAndPaginate() {
    this.reload$.pipe(takeUntil(this.destroy$)).subscribe(() => (this.isReload = true));
    combineLatest([this.reload$, this.paginate$])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([, paginationOptions]) => {
          this.isLoading = true;
          const _criteria = this.enablePagination
            ? {
                ...this.criteria,
                limit: paginationOptions.limit,
                offset: paginationOptions.offset,
              }
            : this.criteria;
          return this.dataLoadFn(_criteria).pipe(
            takeUntil(this.destroy$),
            catchError(() => {
              return of<Pagination<T>>({ count: 0, transactionList: [] });
            }),
            finalize(() => {
              this.isLoading = false;
              this.isReload = false;
            })
          );
        })
      )
      .subscribe(({ count, transactionList }) => {
        this.data$.next(transactionList);
        this.length = count;
      });
  }

  // private _initializeDataSource() {
  //   const paginatedData = this.sortedData$.pipe(
  //     map((data) => {
  //       if (this.offset + this.pageSize > this.length) return data.slice(this.offset);
  //       else return data.slice(this.offset, this.offset + this.pageSize);
  //     })
  //   );

  //   this.dataSource.setItems(paginatedData);
  // }

  private _initializeSort() {
    this.sortControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (!value) return;

      // this.sortedData$ = this.data$.pipe(
      //   map((data) => {
      //     return data.sort((a, b) => {
      //       if (value?.direction === 'desc') return b[value.column as keyof T] > a[value.column as keyof T] ? 1 : -1;
      //       else return a[value.column as keyof T] > b[value.column as keyof T] ? 1 : -1;
      //     });
      //   })
      // );

      // this._initializeDataSource();
    });
  }
}
