import { CmsErrorStatus } from '@enums/cms-error-status';
import { CmsValidationType } from '@enums/cms-validation-type';

export interface CmsErrorContract {
  errors: { extensions: { code: CmsErrorStatus; field: string; type?: CmsValidationType }; message: string }[];
}
