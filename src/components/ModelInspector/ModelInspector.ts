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

import type {
    ICloneable,
    TModelInspectorProps,
} from "./types"


function truthy(v: any) {
    return v != null
}

export const ModelInspector = defineComponent(
    <T extends ICloneable>(props: TModelInspectorProps<T>, { emit }) => {
        return () => {
            const meta = getModelMetadata(props.modelValue.constructor as TConstructor)
            const fields = Object.values(meta)
                .map(modelFieldMeta => {
                    if (isChoiceFieldConfig(modelFieldMeta)) {
                        return h(ChoiceField, {
                            ...props,
                            modelFieldMeta,
                            "onUpdate:modelValue": value => {
                                const model = props.modelValue.clone()
                                modelFieldMeta.access.set(model, value)
                                emit("update:modelValue", model)
                            },
                        })
                    }
                    if (isRangeFieldConfig(modelFieldMeta)) {
                        return h(RangeField, {
                            ...props,
                            modelFieldMeta,
                            "onUpdate:modelValue": value => {
                                const model = props.modelValue.clone()
                                modelFieldMeta.access.set(model, value)
                                emit("update:modelValue", model)
                            },
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
    },
    { props: ["modelValue"], emits: ["update:modelValue"],}
)
