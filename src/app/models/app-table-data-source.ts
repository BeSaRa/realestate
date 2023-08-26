import { BehaviorSubject, isObservable, Observable, Subject, takeUntil, tap } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

export class AppTableDataSource<M> extends MatTableDataSource<M> {
  private _dataItems = new BehaviorSubject<M[]>([]);
  private _destroy$: Subject<void> = new Subject<void>();

  constructor(items: Observable<M[]> | M[]) {
    super();
    this.setItems(items);
  }

  // get data() {
  //   return this._dataItems.value;
  // }

  override connect(): BehaviorSubject<M[]> {
    return this._dataItems;
  }

  override disconnect(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._destroy$.unsubscribe();
  }

  setItems(items: Observable<M[]> | M[]) {
    if (isObservable(items)) {
      this.listenToDataChanges(items);
    } else {
      this._dataItems.next(items);
    }
  }

  private listenToDataChanges(items: Observable<M[]>) {
    items
      .pipe(takeUntil(this._destroy$))
      .pipe(tap((data) => this._dataItems.next(data)))
      .subscribe({
        next: () => {
          //
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => {
          //
        },
      });
  }
}
