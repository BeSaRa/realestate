import { MenuItem } from '@models/menu-item';
import { SectionGuard } from '@models/section-guard';

export class PageSections extends MenuItem {
  sections!: Record<string, SectionGuard>;

  isSectionHidden(sectionName: string) {
    return this.sections[sectionName] ? this.sections[sectionName].isHidden() : false;
  }
}
