import {
    defineComponent,
    h,
} from "vue"

import {
    TRangeFieldConfig,
} from "../../decorators"

import InputRange from "../InputRange.vue"


export default defineComponent<{
    fieldMeta: TRangeFieldConfig,
    model: any,
}, {
    changed(name: string): void
}>((props, { emit }) => {
    const {
        model,
        fieldMeta: {
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
                modelValue: access.get(model),
                "onUpdate:modelValue": (value: number) => {
                    access.set(model, value)
                    emit("changed", name)
                }
            }),
            h("label", {
                class: "text-left",
                innerHTML: `${access.get(model)}`,
            })
        ]
    }
}, { props: ["fieldMeta", "model"], emits: ["changed"] })
