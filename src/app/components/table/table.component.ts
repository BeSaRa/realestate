import { CommonModule } from '@angular/common';
import { Component, ContentChildren, Input, OnInit, QueryList, inject } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DisplayedColumnContract } from '@contracts/displayed-column-contract';
import { TableColumnTemplateDirective } from '@directives/table-column-template.directive';
import { AppTableDataSource } from '@models/app-table-data-source';
import { TranslationService } from '@services/translation.service';
import { Observable, isObservable, map, tap } from 'rxjs';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input({ required: true }) data!: unknown[] | Observable<unknown[]>;
  @Input({ required: true }) displayedColumns!: DisplayedColumnContract[];
  @Input() pageSize = 5;

  @ContentChildren(TableColumnTemplateDirective) columnsTemplates!: QueryList<TableColumnTemplateDirective>;

  dataSource!: AppTableDataSource<unknown>;

  length!: number;
  pageSizeOptions: number[] = [2, 5, 10];
  showFirstLastButtons = true;
  offset = 0;

  lang = inject(TranslationService);

  get displayedColumnsNames() {
    return this.displayedColumns.map((c) => c.columnName);
  }

  ngOnInit(): void {
    this._initializeLength();
    this._initializeDataSource();
  }

  getColumnTemplate(columnName: string) {
    return this.columnsTemplates.find((c) => c.columnName === columnName);
  }

  paginate($event: PageEvent) {
    this.offset = $event.pageSize * $event.pageIndex;
    this.pageSize = $event.pageSize;
    this._initializeDataSource();
  }

  private _initializeLength() {
    if (isObservable(this.data)) {
      this.data.pipe(tap((data) => (this.length = data.length)));
    } else {
      this.length = this.data.length;
    }
  }

  private _initializeDataSource() {
    let paginatedData = this.data;
    if (isObservable(this.data)) {
      paginatedData = this.data.pipe(
        map((data) => {
          if (this.offset + this.pageSize > this.length) return data.slice(this.offset);
          else return data.slice(this.offset, this.offset + this.pageSize);
        })
      );
    } else {
      if (this.offset + this.pageSize > this.length) paginatedData = this.data.slice(this.offset);
      else paginatedData = this.data.slice(this.offset, this.offset + this.pageSize);
    }
    this.dataSource = new AppTableDataSource(paginatedData);
  }
}
