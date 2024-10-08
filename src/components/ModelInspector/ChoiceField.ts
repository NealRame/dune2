import {
    defineComponent,
    h,
} from "vue"

import {
    type TChoiceFieldConfig,
} from "../../decorators"

import type {
    ICloneable,
    TModelInspectorProps,
} from "./types"


type TModelInspectorChoiceFieldProps<T extends ICloneable> =
    TModelInspectorProps<T> & {
        modelFieldMeta: TChoiceFieldConfig,
    }

export default defineComponent(
    <T  extends ICloneable>(props: TModelInspectorChoiceFieldProps<T>, { emit }) => {
        const {
            modelValue,
            modelFieldMeta: {
                access,
                label,
                name,
                values,
        } } = props

        return () => {
            return [
                h("label", {
                    class: "after:content-[':'] text-right",
                    innerHTML: label ?? name,
                }),
                h("select", {
                    class: "bg-inherit border-2 col-span-2 cursor-pointer outline-0 rounded",
                    modelValue: access.get(modelValue),
                    "onChange": (ev: InputEvent) => {
                        const target = ev.target as HTMLSelectElement
                        emit("update:modelValue", target.value)
                    },
                }, values.map(innerHTML => h("option", { innerHTML }))),
            ]
        }
    },
    { props: ["modelFieldMeta", "modelValue"], emits: ["update:modelValue"] },
)
