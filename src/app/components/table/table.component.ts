import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Input, OnInit, Output, QueryList, inject, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SelectInputComponent } from '@components/select-input/select-input.component';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { AppTableDataSource } from '@models/app-table-data-source';
import { TableSortOption } from '@models/table-sort-option';
import { TranslationService } from '@services/translation.service';
import { Observable, isObservable, map, tap } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, SelectInputComponent, ReactiveFormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends object> implements OnInit {
  // @Input({ required: true }) data!: T[] | Observable<T[]>;
  @Input() pageSize = 5;
  @Input() minWidth = '1000px';
  @Input() headerBgColor = '!bg-primary';
  @Input() sortOptions: TableSortOption[] = [];
  @Input() defaultSortOption?: TableSortOption;
  @Input() length = 0;

  @Output() paginate: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ContentChildren(TableColumnTemplateDirective) columnsTemplates!: QueryList<TableColumnTemplateDirective>;

  @Input() dataSource = new AppTableDataSource<T>([]);
  data: T[] | Observable<T[]> = this.dataSource.data as unknown as Observable<T[]>;
  sortedData!: T[] | Observable<T[]>;

  // length!: number;
  pageSizeOptions: number[] = [2, 5, 10];
  showFirstLastButtons = true;
  offset = 0;

  lang = inject(TranslationService);

  sortControl = new FormControl<{ column: string; direction: 'asc' | 'desc' } | undefined>(undefined);

  ngOnInit(): void {
    this.sortedData = this.data;
    // this._initializeLength();
    // this._initializeDataSource();
    this._initializeSort();
    this.sortControl.patchValue(this.defaultSortOption?.value);
  }

  getColumnTemplate(columnName: string) {
    return this.columnsTemplates.find((c) => c.columnName === columnName);
  }

  get displayedColumnNames() {
    return this.columnsTemplates.map((c) => c.columnName);
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
    this.sortControl.valueChanges.subscribe((value) => {
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
