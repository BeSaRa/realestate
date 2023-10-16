export class Link {
    label:  () => string;
    url: string;
    authRequired: boolean;
  
    constructor(label: () => string, url: string, authRequired: boolean = false) {
      this.label = label;
      this.url = url;
      this.authRequired = authRequired;
    }
  }