import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { ScreenBreakpoints } from '@constants/screen-breakpoints';
import { Breakpoints } from '@enums/breakpoints';
import { filter, map, merge } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenBreakpointsService {
  private _breakPointObserver = inject(BreakpointObserver);

  xs$ = this._breakPointObserver.observe(ScreenBreakpoints.xs).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.XS)
  );

  sm$ = this._breakPointObserver.observe(ScreenBreakpoints.sm).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.SM)
  );

  md$ = this._breakPointObserver.observe(ScreenBreakpoints.md).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.MD)
  );

  lg$ = this._breakPointObserver.observe(ScreenBreakpoints.lg).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.LG)
  );

  xl$ = this._breakPointObserver.observe(ScreenBreakpoints.xl).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.XL)
  );

  xl2$ = this._breakPointObserver.observe(ScreenBreakpoints.xl2).pipe(
    map((result) => result.matches),
    filter((result) => result),
    map(() => Breakpoints.XL2)
  );

  screenSizeObserver$ = merge(this.xs$, this.sm$, this.md$, this.lg$, this.xl$, this.xl2$);
}
