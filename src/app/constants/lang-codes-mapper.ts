import { LangCodes } from '@enums/lang-codes';

export const LangCodesMapper: Record<string, LangCodes> = {
  en: LangCodes.EN,
  ar: LangCodes.AR,
};

export type LangCodesMapperType = typeof LangCodesMapper;
