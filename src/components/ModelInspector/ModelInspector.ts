import {
    defineComponent,
    h,
} from "vue"

import {
    type TConstructor,
    getModelMetadata,
    isChoiceFieldConfig,
    isRangeFieldConfig,
} from "../../decorators"

import ChoiceField from "./ChoiceField"
import RangeField from "./RangeField"


function truthy(v: any) {
    return v != null
}

export const ModelInspector = defineComponent<{
    model: any,
}, {
    changed(name: string): void,
}>(({ model }, { emit }) => {
    const onChanged = (name: string) => emit("changed", name)

    return () => {
        const meta = getModelMetadata(model.constructor as TConstructor)
        const fields = Object.values(meta)
            .map(fieldMeta => {
                if (isChoiceFieldConfig(fieldMeta)) {
                    return h(ChoiceField, {
                        fieldMeta,
                        model,
                        onChanged,
                    })
                }
                if (isRangeFieldConfig(fieldMeta)) {
                    return h(RangeField, {
                        fieldMeta,
                        model,
                        onChanged,
                    })
                }
                return null
            })
            .filter(truthy)
        
        return [h("form", {
            class: [
                "gap-x-1",
                "gap-y-1",
                "grid",
                "grid-cols-[50%_1fr_3rem]",
                "text-sm",
                "text-white"
            ],
        }, fields)]
    }
}, { props: ["model"], emits: ["changed"], })
