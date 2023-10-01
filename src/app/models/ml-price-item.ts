// const { send, receive } = new MLPriceItemInterceptor();

import { ClonerMixin } from "@mixins/cloner-mixin";
import { GetNamesMixin } from "@mixins/get-names-mixin";
import { Lookup } from "./lookup";

// @InterceptModel({ send, receive })
export class MLPriceItem extends ClonerMixin(GetNamesMixin(class {})) {
    kpiCurrent!: number;
    kpiPast!: number;
    kpiPredicated!: number;
    propertyTypeId!: number;

    propertyTypeInfo!: Lookup;
}