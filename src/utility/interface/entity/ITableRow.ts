import { ICRUDEntity } from "./ICRUDEntity";

export interface ITableRow extends ICRUDEntity {
    keysListId: string

    getValue: (key: string) => any


    getContent: () => any

    update: (callback: (err: URIError) => void, content: any) => void

    delete: (callback: (err: URIError) => void) => void
}