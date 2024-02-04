import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { lookupsResolver } from './lookups.resolver';

describe('lookupsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => lookupsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
