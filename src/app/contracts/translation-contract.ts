export interface TranslationAddContract {
  key: string;
  language: string;
  value: string;
}

export interface TranslationContract extends TranslationAddContract {
  id: string;
}
