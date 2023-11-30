import { InjectionToken } from '@angular/core';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { PagesSectionsType } from './pages-sections';

export const NGX_COUNTUP_OPTIONS = new InjectionToken<CountUpOptionsContract>('NGX_COUNTUP_OPTIONS');
export const APP_PAGES_SECTIONS = new InjectionToken<PagesSectionsType>('APP_PAGES_SECTIONS');
