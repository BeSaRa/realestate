import { InjectionToken } from '@angular/core';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';

export const NGX_COUNTUP_OPTIONS = new InjectionToken<CountUpOptionsContract>('NGX_COUNTUP_OPTIONS');
