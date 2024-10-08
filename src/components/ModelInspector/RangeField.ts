import {
    defineComponent,
    h,
    ref,
} from "vue"

import {
    TRangeFieldConfig,
} from "../../decorators"

import InputRange from "../InputRange.vue"

import type {
    ICloneable,
    TModelInspectorProps,
} from "./types"



type TModelInspectorRangeFieldProps<T extends ICloneable> =
    TModelInspectorProps<T> & {
        modelFieldMeta: TRangeFieldConfig,
    }

export default defineComponent(
    <T extends ICloneable>(props: TModelInspectorRangeFieldProps<T>, { emit }) => {
        const {
            modelValue,
            modelFieldMeta: {
                access,
                label,
                name,
                max,
                min,
                step
        } } = props

        return () => {
            return [
                h("label", {
                    class: "text-right",
                    innerHTML: label ?? name,
                }),
                h(InputRange, {
                    max,
                    min,
                    step,
                    modelValue: access.get(modelValue),
                    "onUpdate:modelValue": (value: number) => {
                        emit("update:modelValue", value)
                    }
                }),
                h("label", {
                    class: "text-left",
                    innerHTML: `${access.get(modelValue)}`,
                })
            ]
        }
    },
    { props: ["modelFieldMeta", "modelValue"], emits: ["update:modelValue"] }
)
