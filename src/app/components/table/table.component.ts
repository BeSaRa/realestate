import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AppTableDataSource } from '@models/app-table-data-source';
import { TableSortOption } from '@models/table-sort-option';
import { SectionGuardService } from '@services/section-guard.service';
import { TranslationService } from '@services/translation.service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  finalize,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    SelectInputComponent,
    ReactiveFormsModule,
    MatProgressBarModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends object> extends OnDestroyMixin(class {}) implements OnInit, OnChanges {
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) dataLoadFn!: (
    criteria: CriteriaContract
  ) => Observable<{ count: number; transactionList: T[] }>;
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

  lang = inject(TranslationService);
  sectionGuardService = inject(SectionGuardService);

  sortControl = new FormControl<{ column: string; direction: 'asc' | 'desc' } | undefined>(undefined);

  data$ = new BehaviorSubject<T[]>([]);
  dataSource = new AppTableDataSource<T>(this.data$);

  reload$ = new Subject<void>();
  paginate$ = new BehaviorSubject({
    offset: 0,
    limit: 5,
  });

  sortedData$ = this.data$.asObservable();

  length = 0;
  pageSizeOptions: number[] = [2, 5, 10];
  showFirstLastButtons = true;
  offset = 0;

  isLoading = false;
  isReload = false;

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
    this._listenToTransactionsReloadAndPaginate();
    this._initializeSort();
    this.sortControl.patchValue(this.defaultSortOption?.value);
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
        throttleTime(500),
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
