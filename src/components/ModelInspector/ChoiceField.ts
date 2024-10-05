import {
    defineComponent,
    h,
} from "vue"

import {
    type TChoiceFieldConfig,
} from "../../decorators"

export default defineComponent<{
    fieldMeta: TChoiceFieldConfig,
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
                modelValue: access.get(model),
                "onChange": (ev: InputEvent) => {
                    const target = ev.target as HTMLSelectElement
                    access.set(model, target.value)
                    emit("changed", name)
                },
            }, values.map(innerHTML => h("option", { innerHTML }))),
        ]
    }
}, { props: ["model", "fieldMeta"], emits: ["changed"] })
