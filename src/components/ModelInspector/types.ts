import {
    type TChoiceFieldConfig,
} from "../../decorators"


export interface ICloneable {
    clone(): this
}

export type TModelInspectorProps<T extends ICloneable> = {
    modelValue: T,
}
