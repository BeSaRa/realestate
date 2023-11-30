import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Input,
  OnInit,
  Output,
  QueryList,
  inject,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  OnChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AppTableDataSource } from '@models/app-table-data-source';
import { TableSortOption } from '@models/table-sort-option';
import { SectionGuardService } from '@services/section-guard.service';
import { TranslationService } from '@services/translation.service';
import { Observable, isObservable, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, SelectInputComponent, ReactiveFormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends object> extends OnDestroyMixin(class {}) implements OnInit, OnChanges {
  @Input() dataSource = new AppTableDataSource<T>([]);
  @Input() pageSize = 5;
  @Input() minWidth = '1000px';
  @Input() headerBgColor = '!bg-primary';
  @Input() sortOptions: TableSortOption[] = [];
  @Input() defaultSortOption?: TableSortOption;
  @Input() length = 0;
  @Input() tableGuardName = '';

  @Output() paginate: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild('paginator') paginator!: MatPaginator;
  @ContentChildren(TableColumnTemplateDirective) columnsTemplates!: QueryList<TableColumnTemplateDirective>;

  data: T[] | Observable<T[]> = this.dataSource.data as unknown as Observable<T[]>;
  sortedData!: T[] | Observable<T[]>;

  // length!: number;
  pageSizeOptions: number[] = [2, 5, 10];
  showFirstLastButtons = true;
  offset = 0;

  lang = inject(TranslationService);
  sectionGuardService = inject(SectionGuardService);

  sortControl = new FormControl<{ column: string; direction: 'asc' | 'desc' } | undefined>(undefined);

  ngOnChanges(changes: SimpleChanges): void {
    if ('length' in changes) {
      this.offset = 0;
      this.paginator && this.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    this.sortedData = this.data;
    this._initializeSort();
    this.sortControl.patchValue(this.defaultSortOption?.value);
  }

  getColumnTemplate(columnName: string) {
    return this.columnsTemplates.find((c) => c.columnName === columnName);
  }

  get displayedColumnNames() {
    return this.columnsTemplates.map((c) => c.columnName).filter((c) => !this.isColumnHidden(c));
  }

  isColumnHidden(columnName: string) {
    return this.sectionGuardService.currentPageSectionsGuards
      ? this.sectionGuardService.currentPageSectionsGuards.sections[this.tableGuardName]
        ? this.sectionGuardService.currentPageSectionsGuards.sections[this.tableGuardName].isColumnHidden(columnName)
        : false
      : false;
  }

  _paginate($event: PageEvent) {
    this.paginate.emit($event);
    this.offset = $event.pageSize * $event.pageIndex;
    this.pageSize = $event.pageSize;
    // this._initializeDataSource();
  }

  private _initializeDataSource() {
    let paginatedData = this.sortedData;
    if (isObservable(this.sortedData)) {
      paginatedData = this.sortedData.pipe(
        map((data) => {
          // this.length = data.length;
          if (this.offset + this.pageSize > this.length) return data.slice(this.offset);
          else return data.slice(this.offset, this.offset + this.pageSize);
        })
      );
    } else {
      if (this.offset + this.pageSize > this.length) paginatedData = this.sortedData.slice(this.offset);
      else paginatedData = this.sortedData.slice(this.offset, this.offset + this.pageSize);
    }
    this.dataSource.setItems(paginatedData);
  }

  private _initializeSort() {
    this.sortControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (!value) return;
      if (isObservable(this.data)) {
        this.sortedData = this.data.pipe(
          map((data) => {
            return data.sort((a, b) => {
              if (value?.direction === 'desc') return b[value.column as keyof T] > a[value.column as keyof T] ? 1 : -1;
              else return a[value.column as keyof T] > b[value.column as keyof T] ? 1 : -1;
            });
          })
        );
      } else {
        this.sortedData = this.data.sort((a, b) => {
          if (value?.direction === 'desc') return b[value.column as keyof T] > a[value.column as keyof T] ? 1 : -1;
          else return a[value.column as keyof T] > b[value.column as keyof T] ? 1 : -1;
        });
      }
      this._initializeDataSource();
    });
  }
}
