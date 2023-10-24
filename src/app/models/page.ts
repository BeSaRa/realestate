export interface PageTranslationsContentContract {
  id: number;
  languages_code: string;
  title: string;
  content: string;
}

export class Page {
  id!: number;
  status!: string;
  translations!: PageTranslationsContentContract[];
}
