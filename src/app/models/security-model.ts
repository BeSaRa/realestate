import { MenuItem } from '@models/menu-item';
import { Section } from '@models/section';

export class SecurityModel extends MenuItem {
  sections!: Record<string, Section>;

  isSectionExists(sectionName: string): boolean {
    return !!this.sections[sectionName];
  }

  getSection(sectionName: string): Section | undefined {
    return this.isSectionExists(sectionName) ? this.sections[sectionName] : undefined;
  }
}
